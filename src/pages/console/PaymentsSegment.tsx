/* ───────────────────────────────────────────
   Payments Console Segment
   ─────────────────────────────────────────── */

import { useState, useMemo, useCallback } from "react";
import { Calculator, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { moneyValue, roundMoney } from "@/lib/utils";
import { getAllPaymentGroups } from "@/lib/payments";
import PaymentModal from "@/components/modals/PaymentModal";
import PaymentStagesModal from "@/components/modals/PaymentStagesModal";
import type { Payment } from "@/types";

interface PaymentsSegmentProps {
  projectId: string;
}

export default function PaymentsSegment({ projectId }: PaymentsSegmentProps) {
  const { state, refresh } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [stagesModalOpen, setStagesModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const payments = useMemo(() => {
    return (state.cache.payments || []).filter((p) => p.projectId === projectId);
  }, [state.cache.payments, projectId]);

  const paymentGroups = useMemo(() => {
    return getAllPaymentGroups(projectId);
  }, [payments, projectId]);

  /* ─── Summary calculations ─── */
  const summary = useMemo(() => {
    const clientReceived = payments
      .filter((p) => p.paymentDirection === "in")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const totalOutgoing = payments
      .filter((p) => p.paymentDirection === "out")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const pending = payments
      .filter((p) => p.paymentDirection === "out" && p.status === "Pending")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const smallExpenses = payments
      .filter((p) => p.paymentDirection === "out" && (p.payee || "").toLowerCase().includes("petty"))
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    /* Outstanding balance = total invoices - client receipts */
    const totalInvoices = paymentGroups.reduce((s, g) => s + g.totalInvoice, 0);
    const outstanding = roundMoney(totalInvoices - clientReceived);

    return {
      clientReceived,
      outstanding,
      totalOutgoing,
      pending,
      smallExpenses,
      netBalance: roundMoney(clientReceived - totalOutgoing),
    };
  }, [payments, paymentGroups]);

  /* ─── Toggle group expand ─── */
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  /* ─── Handlers ─── */
  const handleNew = useCallback(() => {
    setEditingPayment(null);
    setActiveGroupId("");
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((payment: Payment) => {
    setEditingPayment(payment);
    setActiveGroupId("");
    setModalOpen(true);
  }, []);

  const handleAddStage = useCallback((groupId: string) => {
    setActiveGroupId(groupId);
    /* Find a representative payment from the group to pass */
    const group = paymentGroups.find((g) => g.groupId === groupId);
    if (group && group.payments.length > 0) {
      setEditingPayment(group.payments[0]);
    } else {
      setEditingPayment(null);
    }
    setStagesModalOpen(true);
  }, [paymentGroups]);

  const handleSaved = useCallback(() => {
    refresh();
    setModalOpen(false);
    setStagesModalOpen(false);
  }, [refresh]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Complete":
        return { bg: "#d4edda", color: "#155724" };
      case "Active":
      case "Pending":
        return { bg: "#fff3cd", color: "#856404" };
      default:
        return { bg: "#e2e3e5", color: "#383d41" };
    }
  };

  const getGroupStatus = (group: typeof paymentGroups[0]) => {
    if (group.balance <= 0.01) return "Complete";
    if (group.totalPaid > 0) return "Active";
    return "Logged";
  };

  return (
    <div className="space-y-3">
      {/* Summary Card */}
      <div className="card space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Calculator className="size-4" />
          Financial Summary
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="card-light">
            <div className="text-xs text-muted-foreground">Client Received</div>
            <div className="font-semibold text-green-600">{moneyValue(summary.clientReceived)}</div>
          </div>
          <div className="card-light">
            <div className="text-xs text-muted-foreground">Outstanding</div>
            <div className="font-semibold text-orange-600">{moneyValue(summary.outstanding)}</div>
          </div>
          <div className="card-light">
            <div className="text-xs text-muted-foreground">Total Outgoing</div>
            <div className="font-semibold text-red-600">{moneyValue(summary.totalOutgoing)}</div>
          </div>
          <div className="card-light">
            <div className="text-xs text-muted-foreground">Pending</div>
            <div className="font-semibold">{moneyValue(summary.pending)}</div>
          </div>
          <div className="card-light">
            <div className="text-xs text-muted-foreground">Small Expenses</div>
            <div className="font-semibold">{moneyValue(summary.smallExpenses)}</div>
          </div>
          <div className="card-light">
            <div className="text-xs text-muted-foreground">Net Balance</div>
            <div className={`font-semibold ${summary.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {moneyValue(summary.netBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Payment Groups ({paymentGroups.length})</h3>
        <button onClick={handleNew} className="action-btn text-xs py-1.5">
          <Plus className="size-3.5 mr-1" />
          New Payment
        </button>
      </div>

      {/* Payment Groups */}
      {paymentGroups.length === 0 && (
        <div className="card text-center py-8 text-muted-foreground">
          <Calculator className="size-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No payments recorded yet.</p>
          <button onClick={handleNew} className="action-btn mt-3 text-xs">
            <Plus className="size-3.5 mr-1" />
            Record Payment
          </button>
        </div>
      )}

      {paymentGroups.map((group) => {
        const isExpanded = expandedGroups.has(group.groupId);
        const status = getGroupStatus(group);
        const badgeStyle = getStatusBadgeClass(status);
        const canAddStage = group.balance > 0.01 && group.payments.length < 4;

        return (
          <div key={group.groupId} className="card p-0 overflow-hidden">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.groupId)}
              className="w-full flex items-center justify-between p-3 hover:bg-[var(--card-light)] transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{group.groupId === "ungrouped" ? "Individual" : group.groupId}</span>
                  <span
                    className="status-badge text-[10px]"
                    style={{ background: badgeStyle.bg, color: badgeStyle.color }}
                  >
                    {status}
                  </span>
                </div>
                <div className="text-sm font-medium mt-0.5">
                  {group.payments[0]?.payee || "Unknown"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {group.payments[0]?.paymentDirection === "in" ? "Receipt" : "Outgoing"} &middot; {group.payments.length} stage{group.payments.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="font-semibold text-sm">{moneyValue(group.totalInvoice)}</div>
                  <div className={`text-xs ${group.balance > 0 ? "text-orange-600" : "text-green-600"}`}>
                    Bal: {moneyValue(group.balance)}
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </div>
            </button>

            {/* Expanded stages */}
            {isExpanded && (
              <div className="border-t px-3 py-2 space-y-1 bg-[var(--card-light)]">
                {group.payments.map((payment, idx) => (
                  <button
                    key={payment.paymentId}
                    onClick={() => handleEdit(payment)}
                    className="w-full flex items-center justify-between py-1.5 px-2 rounded hover:bg-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-8">St{payment.stage || idx + 1}</span>
                      <span className="text-xs text-muted-foreground">{payment.paymentDate}</span>
                    </div>
                    <div className={`text-sm font-medium ${payment.paymentDirection === "in" ? "text-green-600" : "text-red-600"}`}>
                      {payment.paymentDirection === "in" ? "+" : "-"}{moneyValue(payment.amount)}
                    </div>
                  </button>
                ))}

                {/* Balance row */}
                <div className="flex items-center justify-between py-1.5 px-2 border-t mt-1">
                  <span className="text-xs font-medium">Balance</span>
                  <span className={`text-sm font-semibold ${group.balance > 0 ? "text-orange-600" : "text-green-600"}`}>
                    {moneyValue(group.balance)}
                  </span>
                </div>

                {/* Add stage button */}
                {canAddStage && (
                  <button
                    onClick={() => handleAddStage(group.groupId)}
                    className="w-full text-center py-1.5 text-xs font-medium text-[var(--primary)] hover:underline mt-1"
                  >
                    <Plus className="size-3 inline mr-1" />
                    Add Stage {group.payments.length + 1}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        payment={editingPayment}
        onSaved={handleSaved}
      />

      {/* Stages Modal */}
      <PaymentStagesModal
        isOpen={stagesModalOpen}
        onClose={() => setStagesModalOpen(false)}
        projectId={projectId}
        groupId={activeGroupId}
        onSaved={handleSaved}
      />
    </div>
  );
}
