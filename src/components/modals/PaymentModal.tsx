/* ───────────────────────────────────────────
   Payment Modal — Create / Edit staged payment
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback, useMemo } from "react";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AttachmentUpload from "@/components/AttachmentUpload";
import { callApi, getCache } from "@/lib/api";
import { roundMoney, moneyValue } from "@/lib/utils";
import { onPaymentDirectionChange, getPaymentGroupData } from "@/lib/payments";
import type { Payment, Project, Vendor } from "@/types";

const PAYMENT_DIRECTIONS = [
  { value: "in", label: "Client Receipt" },
  { value: "out", label: "Outgoing Payment" },
  { value: "petty", label: "Small Expense" },
];

const EXPENSE_CATEGORIES = [
  "Labour",
  "Materials",
  "Subcontractor Cost",
  "Transport",
  "Misc",
];

const PAYMENT_METHODS = [
  "Transfer",
  "Cash",
  "Cheque",
  "POS",
  "Other",
];

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  payment?: Payment | null;
  groupId?: string;
  addStage?: boolean;
  onSaved: () => void;
}

export default function PaymentModal({ isOpen, onClose, projectId, payment, groupId, addStage, onSaved }: PaymentModalProps) {
  const isEdit = !!payment && !addStage;
  const projects = useMemo(() => (getCache("projects") || []) as Project[], []);
  const vendors = useMemo(() => (getCache("vendors") || []) as Vendor[], []);
  const allPayments = useMemo(() => (getCache("payments") || []) as Payment[], []);

  const [paymentId, setPaymentId] = useState("");
  const [direction, setDirection] = useState<"in" | "out" | "petty">("out");
  const [payee, setPayee] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [totalInvoice, setTotalInvoice] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState("");
  const [status, setStatus] = useState("Logged");
  const [stage, setStage] = useState("1");
  const [saving, setSaving] = useState(false);

  /* ─── Derived values for staged payments ─── */
  const [paymentsToDate, setPaymentsToDate] = useState(0);
  const [balanceRemaining, setBalanceRemaining] = useState(0);

  /* ─── Populate form ─── */
  useEffect(() => {
    if (!isOpen) return;

    if (payment && addStage && groupId) {
      /* Adding a new stage to existing group */
      const groupData = getPaymentGroupData(groupId, payment.paymentId);
      const currentStage = groupData.payments.length + 1;
      setPaymentId("");
      setDirection((payment.paymentDirection as "in" | "out" | "petty") || "out");
      setPayee(payment.payee || "");
      setExpenseCategory(payment.expenseCategory || "");
      setTotalInvoice(String(payment.totalInvoice || ""));
      setAmount("");
      setPaymentMethod(payment.paymentMethod || "Transfer");
      setNotes("");
      setAttachments("");
      setStatus("Logged");
      setStage(String(currentStage));
      setPaymentsToDate(groupData.totalPaid);
      setBalanceRemaining(roundMoney(groupData.totalInvoice - groupData.totalPaid));
    } else if (payment) {
      /* Edit existing */
      setPaymentId(payment.paymentId);
      setDirection((payment.paymentDirection as "in" | "out" | "petty") || "out");
      setPayee(payment.payee || "");
      setExpenseCategory(payment.expenseCategory || "");
      setTotalInvoice(String(payment.totalInvoice || ""));
      setAmount(String(payment.amount || ""));
      setPaymentMethod(payment.paymentMethod || "Transfer");
      setNotes(payment.notes || "");
      setAttachments(payment.attachments || "");
      setStatus(payment.status || "Logged");
      setStage(payment.stage || "1");

      if (payment.paymentGroupId) {
        const groupData = getPaymentGroupData(payment.paymentGroupId, payment.paymentId);
        setPaymentsToDate(groupData.totalPaid);
        setBalanceRemaining(roundMoney(groupData.totalInvoice - groupData.totalPaid));
      } else {
        setPaymentsToDate(0);
        setBalanceRemaining(Number(payment.amount) || 0);
      }
    } else {
      /* New payment */
      setPaymentId("");
      setDirection("out");
      setPayee("");
      setExpenseCategory("");
      setTotalInvoice("");
      setAmount("");
      setPaymentMethod("Transfer");
      setNotes("");
      setAttachments("");
      setStatus("Logged");
      setStage("1");
      setPaymentsToDate(0);
      setBalanceRemaining(0);
      onPaymentDirectionChange("out", { setPayee, setExpenseCategory, setPaymentMethod });
    }
  }, [isOpen, payment, addStage, groupId]);

  /* ─── Auto-generate payment ID ─── */
  useEffect(() => {
    if (!isEdit && !paymentId && projectId) {
      const suffix = projectId.slice(-3).padStart(3, "0");
      const projectPayments = allPayments.filter((p) => p.projectId === projectId);
      const seq = String(projectPayments.length + 1).padStart(2, "0");
      setPaymentId(`${suffix}-${seq}`);
    }
  }, [isEdit, paymentId, projectId, allPayments]);

  /* ─── Handle direction change ─── */
  const handleDirectionChange = useCallback((dir: "in" | "out" | "petty") => {
    setDirection(dir);
    if (dir === "petty") {
      setExpenseCategory("Misc");
      setPaymentMethod("Cash");
    } else {
      onPaymentDirectionChange(dir, { setPayee, setExpenseCategory, setPaymentMethod });
    }
    setPayee("");
  }, []);

  /* ─── Recalculate balance when total invoice changes ─── */
  useEffect(() => {
    const ti = parseFloat(totalInvoice) || 0;
    if (ti > 0 && paymentsToDate >= 0) {
      setBalanceRemaining(roundMoney(ti - paymentsToDate));
    }
  }, [totalInvoice, paymentsToDate]);

  /* ─── Save ─── */
  const handleSave = useCallback(async () => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) {
      alert("Amount must be greater than 0.");
      return;
    }
    if (!payee) {
      alert("Please enter a payee.");
      return;
    }

    setSaving(true);
    const payload: Record<string, unknown> = {
      projectId,
      paymentId: isEdit ? payment!.paymentId : paymentId,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentDirection: direction,
      payee,
      expenseCategory: direction === "in" ? "Client Receipt" : expenseCategory,
      referenceId: paymentId,
      amount: amt,
      paymentMethod,
      status,
      stage,
      totalInvoice: parseFloat(totalInvoice) || amt,
      paymentGroupId: groupId || (payment?.paymentGroupId || ""),
      notes,
      attachments,
    };

    try {
      const resp = await callApi(isEdit ? "updatePayment" : "savePayment", payload);
      if (resp.status === "success" || resp.status === "queued") {
        onSaved();
        onClose();
      } else {
        alert(resp.message || "Failed to save payment.");
      }
    } catch {
      alert("Network error — payment queued for sync.");
    } finally {
      setSaving(false);
    }
  }, [amount, payee, direction, projectId, paymentId, isEdit, payment, totalInvoice, paymentMethod, status, stage, groupId, notes, attachments, onSaved, onClose]);

  /* ─── Max amount for stage ─── */
  const maxAmount = balanceRemaining > 0 ? balanceRemaining : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Payment" : addStage ? `Add Stage ${stage}` : "New Payment"}
      size="lg"
      onSubmit={handleSave}
      submitText={saving ? "Saving..." : "Save"}
      submitDisabled={saving}
    >
      <div className="space-y-4">
        {/* Payment ID */}
        <div>
          <Label htmlFor="pay-id" className="mb-1.5 block">Payment ID</Label>
          <Input id="pay-id" value={paymentId} disabled className="bg-muted font-mono text-xs" />
        </div>

        {/* Direction */}
        <div>
          <Label htmlFor="pay-direction" className="mb-1.5 block">Direction</Label>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_DIRECTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => handleDirectionChange(d.value as "in" | "out" | "petty")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  direction === d.value
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-card text-[var(--text)] border-input hover:bg-accent"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payee — changes based on direction */}
        <div>
          <Label htmlFor="pay-payee" className="mb-1.5 block">
            {direction === "in" ? "Received From" : direction === "petty" ? "Description" : "Payee / Vendor"}
          </Label>
          {direction === "out" ? (
            <select
              id="pay-payee"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select vendor...</option>
              {vendors.map((v) => (
                <option key={v.vendorId} value={v.company}>{v.company} ({v.trade})</option>
              ))}
            </select>
          ) : direction === "in" ? (
            <select
              id="pay-payee"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select project / client...</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.clientName}>{p.clientName} — {p.siteLocation}</option>
              ))}
            </select>
          ) : (
            <Input
              id="pay-payee"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="Expense description"
            />
          )}
        </div>

        {/* Category */}
        {direction !== "in" && (
          <div>
            <Label htmlFor="pay-category" className="mb-1.5 block">Category</Label>
            <select
              id="pay-category"
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select category...</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Total Invoice */}
        <div>
          <Label htmlFor="pay-total" className="mb-1.5 block">Total Invoice Amount</Label>
          <Input
            id="pay-total"
            type="number"
            min={0}
            step="any"
            value={totalInvoice}
            onChange={(e) => setTotalInvoice(e.target.value)}
            placeholder="Total invoice amount"
          />
        </div>

        {/* Stage info for staged payments */}
        {(addStage || (Number(stage) > 1)) && (
          <div className="card-light space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payments to Date:</span>
              <span className="font-medium">{moneyValue(paymentsToDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance Remaining:</span>
              <span className={`font-semibold ${balanceRemaining > 0 ? "text-orange-600" : "text-green-600"}`}>
                {moneyValue(balanceRemaining)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stage:</span>
              <span className="font-medium">{stage}</span>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <Label htmlFor="pay-amount" className="mb-1.5 block">
            Amount {maxAmount !== undefined ? `(max ${moneyValue(maxAmount)})` : ""}
          </Label>
          <Input
            id="pay-amount"
            type="number"
            min={0}
            max={maxAmount}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        {/* Payment Method */}
        <div>
          <Label htmlFor="pay-method" className="mb-1.5 block">Payment Method</Label>
          <select
            id="pay-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="pay-status" className="mb-1.5 block">Status</Label>
          <select
            id="pay-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="Logged">Logged</option>
            <option value="Pending">Pending</option>
            <option value="Complete">Complete</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="pay-notes" className="mb-1.5 block">Notes</Label>
          <Textarea
            id="pay-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment notes..."
            rows={3}
          />
        </div>

        {/* Attachments */}
        <AttachmentUpload value={attachments} onChange={setAttachments} />
      </div>
    </Modal>
  );
}
