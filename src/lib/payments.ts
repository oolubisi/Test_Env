/* ───────────────────────────────────────────
   Payment Helpers — Validation, grouping, stages
   ─────────────────────────────────────────── */

import type { Payment } from "@/types";
import { roundMoney, moneyValue } from "./utils";
import { getCache } from "./api";

/* ─── Direction change handler ─── */

export function onPaymentDirectionChange(
  direction: "out" | "in" | "",
  setters: {
    setPayee: (v: string) => void;
    setExpenseCategory: (v: string) => void;
    setPaymentMethod: (v: string) => void;
  }
): void {
  if (direction === "in") {
    setters.setPayee("");
    setters.setExpenseCategory("Client Receipt");
    setters.setPaymentMethod("Transfer");
  } else if (direction === "out") {
    setters.setExpenseCategory("");
    setters.setPaymentMethod("Transfer");
  }
}

/* ─── Balance recalculation ─── */

export function recalcPaymentBalance(
  totalInvoice: number,
  stageAmounts: number[]
): { totalPaid: number; balance: number } {
  const totalPaid = stageAmounts.reduce((sum, amt) => sum + (amt || 0), 0);
  const balance = roundMoney(totalInvoice - totalPaid);
  return { totalPaid: roundMoney(totalPaid), balance };
}

/* ─── Stage validation ─── */

export function validateStageAmount(
  amount: number,
  totalInvoice: number,
  currentTotalPaid: number
): { valid: boolean; error?: string } {
  if (!amount || amount <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }
  const remaining = roundMoney(totalInvoice - currentTotalPaid);
  if (amount > remaining) {
    return {
      valid: false,
      error: `Amount exceeds remaining balance of ${moneyValue(remaining)}`,
    };
  }
  return { valid: true };
}

/* ─── Payment group helpers ─── */

export function getPaymentGroupData(
  groupId: string,
  excludePaymentId?: string
): {
  payments: Payment[];
  totalPaid: number;
  totalInvoice: number;
} {
  if (!groupId) return { payments: [], totalPaid: 0, totalInvoice: 0 };
  const allPayments = (getCache("payments") || []) as Payment[];
  const groupPayments = allPayments.filter(
    (p) =>
      p.paymentGroupId === groupId &&
      (!excludePaymentId || p.paymentId !== excludePaymentId)
  );
  const totalPaid = groupPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );
  const totalInvoice =
    groupPayments.length > 0 ? Number(groupPayments[0].totalInvoice) || 0 : 0;
  return {
    payments: groupPayments,
    totalPaid: roundMoney(totalPaid),
    totalInvoice: roundMoney(totalInvoice),
  };
}

/** Get all payment groups for a project */
export function getAllPaymentGroups(
  projectId: string
): Array<{
  groupId: string;
  payments: Payment[];
  totalPaid: number;
  totalInvoice: number;
  balance: number;
}> {
  if (!projectId) return [];
  const allPayments = (getCache("payments") || []) as Payment[];
  const projectPayments = allPayments.filter((p) => p.projectId === projectId);

  const groupMap = new Map<string, Payment[]>();
  for (const p of projectPayments) {
    const gid = p.paymentGroupId || "ungrouped";
    if (!groupMap.has(gid)) groupMap.set(gid, []);
    groupMap.get(gid)!.push(p);
  }

  return Array.from(groupMap.entries()).map(([groupId, payments]) => {
    const totalPaid = payments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );
    const totalInvoice = Number(payments[0]?.totalInvoice) || 0;
    return {
      groupId,
      payments,
      totalPaid: roundMoney(totalPaid),
      totalInvoice: roundMoney(totalInvoice),
      balance: roundMoney(totalInvoice - totalPaid),
    };
  });
}

/* ─── Stage modal helper ─── */

export function openAddStageModal(
  groupId: string,
  openModal: (opts: { groupId: string; _addStage: boolean }) => void
): void {
  openModal({ groupId, _addStage: true });
}

/* ─── Payment formatter ─── */

export function formatPaymentSummary(p: Payment): string {
  const dir = p.paymentDirection === "in" ? "Receipt" : "Payment";
  return `${dir} — ${p.payee || p.expenseCategory || "Unknown"} — ${moneyValue(p.amount)}`;
}
