/* ───────────────────────────────────────────
   Accounts — Project financial summary
   ─────────────────────────────────────────── */

import { useState, useEffect, useMemo } from "react";
import { Calculator, Loader2Icon, Receipt, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import type { Project, Payment, Variation } from "@/types";
import { useAppState } from "@/hooks/useAppState";
import { moneyValue } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SummaryRow {
  label: string;
  amount: number;
  colorClass?: string;
  isDivider?: boolean;
  icon?: React.ReactNode;
}

export default function Accounts() {
  const { state, loadData } = useAppState();
  const [selectedProjectId, setSelectedProjectId] = useState("");

  /* Initial data load */
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Sorted projects by client name */
  const sortedProjects = useMemo(() => {
    const projects = state.cache.projects || [];
    return [...projects].sort((a: Project, b: Project) =>
      (a.clientName || "").localeCompare(b.clientName || "")
    );
  }, [state.cache.projects]);

  /* Auto-select first project if none selected */
  useEffect(() => {
    if (!selectedProjectId && sortedProjects.length > 0) {
      setSelectedProjectId(sortedProjects[0].projectId);
    }
  }, [sortedProjects, selectedProjectId]);

  /* Selected project */
  const selectedProject = useMemo(() => {
    return (
      sortedProjects.find((p: Project) => p.projectId === selectedProjectId) ||
      null
    );
  }, [sortedProjects, selectedProjectId]);

  /* Filter payments for selected project */
  const projectPayments = useMemo(() => {
    const payments = state.cache.payments || [];
    if (!selectedProjectId) return [];
    return payments.filter(
      (p: Payment) => p.projectId === selectedProjectId
    );
  }, [state.cache.payments, selectedProjectId]);

  /* Variations for selected project */
  const projectVariations = useMemo(() => {
    const variations = state.cache.variations || [];
    if (!selectedProjectId) return [];
    return variations.filter(
      (v: Variation) => v.projectId === selectedProjectId
    );
  }, [state.cache.variations, selectedProjectId]);

  /* Financial calculations */
  const summary = useMemo(() => {
    if (!selectedProject) return null;

    const contractSubtotal = Number(selectedProject.contractSubtotal) || 0;

    /* Client Receipts: sum of payments where direction is "Client Receipt" AND status is "Cleared" */
    const clientReceipts = projectPayments
      .filter(
        (p: Payment) =>
          p.paymentDirection === "Client Receipt" && p.status === "Cleared"
      )
      .reduce((sum: number, p: Payment) => sum + (Number(p.amount) || 0), 0);

    /* Total Outgoing: sum of payments where direction is "Outgoing Payment" AND status is "Cleared" */
    const totalOutgoing = projectPayments
      .filter(
        (p: Payment) =>
          p.paymentDirection === "Outgoing Payment" && p.status === "Cleared"
      )
      .reduce((sum: number, p: Payment) => sum + (Number(p.amount) || 0), 0);

    /* Small Expenses: sum of payments where direction is "Small Expense" AND status is "Cleared" */
    const smallExpenses = projectPayments
      .filter(
        (p: Payment) =>
          p.paymentDirection === "Small Expense" && p.status === "Cleared"
      )
      .reduce((sum: number, p: Payment) => sum + (Number(p.amount) || 0), 0);

    /* Pending Payments: sum of payments where direction is "Outgoing Payment" AND status is "Pending" */
    const pendingPayments = projectPayments
      .filter(
        (p: Payment) =>
          p.paymentDirection === "Outgoing Payment" && p.status === "Pending"
      )
      .reduce((sum: number, p: Payment) => sum + (Number(p.amount) || 0), 0);

    /* Variations total */
    const variationsTotal = projectVariations.reduce(
      (sum: number, v: Variation) => sum + (Number(v.subtotal) || 0),
      0
    );

    /* Balance Expected = contractSubtotal + variationsTotal - clientReceipts */
    const balanceExpected = contractSubtotal + variationsTotal - clientReceipts;

    /* Net Profit = clientReceipts - totalOutgoing - smallExpenses - pendingPayments */
    const netProfit =
      clientReceipts - totalOutgoing - smallExpenses - pendingPayments;

    return {
      contractSubtotal,
      clientReceipts,
      totalOutgoing,
      smallExpenses,
      pendingPayments,
      variationsTotal,
      balanceExpected,
      netProfit,
    };
  }, [selectedProject, projectPayments, projectVariations]);

  /* Summary rows for display */
  const summaryRows: SummaryRow[] = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Contract Subtotal",
        amount: summary.contractSubtotal,
        icon: <Receipt className="size-4 text-muted-foreground" />,
      },
      {
        label: "Total of Client Receipts",
        amount: summary.clientReceipts,
        colorClass: "text-emerald-600",
        icon: <ArrowDownLeft className="size-4 text-emerald-600" />,
      },
      {
        label: "Total Outgoing",
        amount: summary.totalOutgoing,
        colorClass: "text-red-600",
        icon: <ArrowUpRight className="size-4 text-red-600" />,
      },
      {
        label: "Small Expenses",
        amount: summary.smallExpenses,
        icon: <Receipt className="size-4 text-muted-foreground" />,
      },
      {
        label: "Pending Payments",
        amount: summary.pendingPayments,
        colorClass: "text-orange-500",
        icon: <Clock className="size-4 text-orange-500" />,
      },
      { label: "", amount: 0, isDivider: true },
      {
        label: "Balance Expected",
        amount: summary.balanceExpected,
        icon: <Calculator className="size-4 text-muted-foreground" />,
      },
      {
        label: "Net Profit",
        amount: summary.netProfit,
        colorClass: summary.netProfit >= 0 ? "text-emerald-600" : "text-red-600",
        icon: <Calculator className="size-4 text-muted-foreground" />,
      },
    ];
  }, [summary]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Accounts</h2>
      </div>

      {/* Loading */}
      {state.isLoading && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Loader2Icon className="inline-block size-4 animate-spin mr-2" />
          Loading accounts…
        </div>
      )}

      {/* No projects */}
      {!state.isLoading && sortedProjects.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-4xl text-muted-foreground/30 mb-3">
            <Calculator className="inline-block size-12" />
          </div>
          <p className="text-sm text-muted-foreground">
            No projects available. Add a project first to view accounts.
          </p>
        </div>
      )}

      {/* Project Selector */}
      {!state.isLoading && sortedProjects.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Select Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {sortedProjects.map((p: Project) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.clientName} — {p.siteLocation} (ID: {p.projectId})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      {!state.isLoading && selectedProject && summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              {selectedProject.clientName} — Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {summaryRows.map((row, idx) => {
              if (row.isDivider) {
                return <Separator key={`div-${idx}`} className="my-3" />;
              }

              return (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                    {row.icon}
                    <span>{row.label}</span>
                  </div>
                  <span
                    className={`text-sm font-semibold font-mono ${
                      row.colorClass || "text-[var(--text)]"
                    }`}
                  >
                    {moneyValue(row.amount)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Variations note */}
      {!state.isLoading &&
        selectedProject &&
        projectVariations.length > 0 && (
          <div className="text-xs text-muted-foreground px-1">
            {projectVariations.length} variation(s) totaling{" "}
            {moneyValue(
              projectVariations.reduce(
                (s: number, v: Variation) => s + (Number(v.subtotal) || 0),
                0
              )
            )}{" "}
            included in calculations.
          </div>
        )}
    </div>
  );
}
