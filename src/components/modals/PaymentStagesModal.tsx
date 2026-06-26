/* ───────────────────────────────────────────
   PaymentStages Modal — Add a stage to existing payment group
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AttachmentUpload from "@/components/AttachmentUpload";
import { callApi, getCache } from "@/lib/api";
import { roundMoney, moneyValue } from "@/lib/utils";
import { getPaymentGroupData } from "@/lib/payments";
import type { Payment } from "@/types";

const PAYMENT_METHODS = ["Transfer", "Cash", "Cheque", "POS", "Other"];

interface PaymentStagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  groupId: string;
  onSaved: () => void;
}

export default function PaymentStagesModal({ isOpen, onClose, projectId, groupId, onSaved }: PaymentStagesModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState("");
  const [saving, setSaving] = useState(false);

  const [totalInvoice, setTotalInvoice] = useState(0);
  const [paymentsToDate, setPaymentsToDate] = useState(0);
  const [balanceRemaining, setBalanceRemaining] = useState(0);
  const [nextStage, setNextStage] = useState(1);
  const [paymentId, setPaymentId] = useState("");
  const [direction, setDirection] = useState<"in" | "out">("out");
  const [payee, setPayee] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");

  /* ─── Load group data ─── */
  useEffect(() => {
    if (!isOpen || !groupId) return;
    const groupData = getPaymentGroupData(groupId);
    const ti = groupData.totalInvoice;
    const paid = groupData.totalPaid;
    const bal = roundMoney(ti - paid);
    setTotalInvoice(ti);
    setPaymentsToDate(paid);
    setBalanceRemaining(bal);
    setNextStage(groupData.payments.length + 1);

    /* Derive details from first payment in group */
    if (groupData.payments.length > 0) {
      const first = groupData.payments[0];
      setDirection((first.paymentDirection as "in" | "out") || "out");
      setPayee(first.payee || "");
      setExpenseCategory(first.expenseCategory || "");
    }

    /* Generate payment ID */
    const suffix = projectId.slice(-3).padStart(3, "0");
    const allPayments = (getCache("payments") || []) as Payment[];
    const projectPayments = allPayments.filter((p) => p.projectId === projectId);
    const seq = String(projectPayments.length + 1).padStart(2, "0");
    setPaymentId(`${suffix}-${seq}`);
  }, [isOpen, groupId, projectId]);

  const handleSave = useCallback(async () => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) {
      alert("Amount must be greater than 0.");
      return;
    }
    if (amt > balanceRemaining) {
      alert(`Amount exceeds remaining balance of ${moneyValue(balanceRemaining)}`);
      return;
    }

    setSaving(true);
    const payload = {
      projectId,
      paymentId,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentDirection: direction,
      payee,
      expenseCategory,
      referenceId: paymentId,
      amount: amt,
      paymentMethod,
      status: "Logged",
      stage: String(nextStage),
      totalInvoice,
      paymentGroupId: groupId,
      notes,
      attachments,
    };

    try {
      const resp = await callApi("savePayment", payload);
      if (resp.status === "success" || resp.status === "queued") {
        onSaved();
        onClose();
      } else {
        alert(resp.message || "Failed to save payment stage.");
      }
    } catch {
      alert("Network error — payment queued for sync.");
    } finally {
      setSaving(false);
    }
  }, [amount, balanceRemaining, projectId, paymentId, direction, payee, expenseCategory, paymentMethod, nextStage, totalInvoice, groupId, notes, attachments, onSaved, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Stage ${nextStage} Payment`}
      size="md"
      onSubmit={handleSave}
      submitText={saving ? "Saving..." : "Save Stage"}
      submitDisabled={saving || balanceRemaining <= 0}
    >
      <div className="space-y-4">
        {/* Summary */}
        <div className="card-light space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Invoice:</span>
            <span className="font-medium">{moneyValue(totalInvoice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payments to Date:</span>
            <span className="font-medium">{moneyValue(paymentsToDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance:</span>
            <span className="font-semibold text-orange-600">{moneyValue(balanceRemaining)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stage:</span>
            <span className="font-medium">{nextStage}</span>
          </div>
        </div>

        {/* Amount */}
        <div>
          <Label htmlFor="stage-amount" className="mb-1.5 block">
            Amount (max {moneyValue(balanceRemaining)})
          </Label>
          <Input
            id="stage-amount"
            type="number"
            min={0}
            max={balanceRemaining}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        {/* Payment Method */}
        <div>
          <Label htmlFor="stage-method" className="mb-1.5 block">Payment Method</Label>
          <select
            id="stage-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="stage-notes" className="mb-1.5 block">Notes</Label>
          <Textarea
            id="stage-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes for this stage..."
            rows={2}
          />
        </div>

        {/* Attachments */}
        <AttachmentUpload value={attachments} onChange={setAttachments} />
      </div>
    </Modal>
  );
}
