import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";

function fmtN(n) {
  return "₦" + (Number(n) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Accounts() {
  const { cache } = useApp();
  const [selectedId, setSelectedId] = useState("");

  const projects = useMemo(() => cache.projects || [], [cache.projects]);

  const summary = useMemo(() => {
    if (!selectedId) return null;
    const projectPayments = (cache.payments || []).filter((p) => p.projectId === selectedId);
    const receipts = projectPayments.filter((p) => p.paymentDirection === "Inflow");
    const outflows = projectPayments.filter((p) => p.paymentDirection === "Outflow");
    const smallExpenses = projectPayments.filter((p) => p.expenseCategory === "Small Expense");
    const pending = projectPayments.filter((p) => p.status === "Pending");

    const contractSubtotal = Number((cache.projects || []).find((p) => p.projectId === selectedId)?.contractSubtotal || 0);
    const totalReceipts = receipts.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const totalOutgoing = outflows.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const totalSmall = smallExpenses.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const totalPending = pending.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const balanceExpected = contractSubtotal - totalReceipts;
    const netProfit = totalReceipts - totalOutgoing - totalSmall;

    return { contractSubtotal, totalReceipts, totalOutgoing, totalSmall, totalPending, balanceExpected, netProfit };
  }, [cache, selectedId]);

  return (
    <div>
      <div className="card">
        <label>Select Project</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">-- Select Project --</option>
          {projects.map((p) => (
            <option key={p.projectId} value={p.projectId}>{p.clientName} — {p.projectId}</option>
          ))}
        </select>
      </div>

      {summary && (
        <div className="card">
          <div className="flex justify-between mb-2"><span>Contract Subtotal</span><span className="text-right">{fmtN(summary.contractSubtotal)}</span></div>
          <div className="flex justify-between mb-2"><span>Total of Client Receipts</span><span className="text-right text-green">{fmtN(summary.totalReceipts)}</span></div>
          <div className="flex justify-between mb-2"><span>Total Outgoing</span><span className="text-right text-red">{fmtN(summary.totalOutgoing)}</span></div>
          <div className="flex justify-between mb-2"><span>Small Expenses</span><span className="text-right">{fmtN(summary.totalSmall)}</span></div>
          <div className="flex justify-between mb-2"><span>Pending Payments</span><span className="text-right text-orange">{fmtN(summary.totalPending)}</span></div>
          <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }}></div>
          <div className="flex justify-between mb-2"><strong>Balance Expected</strong><strong className="text-right">{fmtN(summary.balanceExpected)}</strong></div>
          <div className="flex justify-between"><strong>Net Profit</strong><strong className="text-right">{fmtN(summary.netProfit)}</strong></div>
        </div>
      )}
    </div>
  );
}