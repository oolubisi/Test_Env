/* ───────────────────────────────────────────
   Work Order Helpers — Line items, totals, dropdowns
   ─────────────────────────────────────────── */

import type { Vendor } from "@/types";
import { getCache } from "./api";
import { roundMoney, moneyValue } from "./utils";

/* ─── Line item management ─── */

export interface WorkOrderLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

let lineItemCounter = 0;

export function addWorkOrderLineItem(
  tbodyRef: HTMLTableSectionElement | null,
  _existingItems?: WorkOrderLineItem[]
): WorkOrderLineItem {
  lineItemCounter++;
  const item: WorkOrderLineItem = {
    id: `wo-li-${Date.now()}-${lineItemCounter}`,
    description: "",
    quantity: 1,
    unit: "nos",
    rate: 0,
    amount: 0,
  };

  /* If tbodyRef provided, insert a row (for vanilla-JS compat) */
  if (tbodyRef) {
    const row = document.createElement("tr");
    row.dataset.lineId = item.id;
    row.innerHTML = `
      <td><input type="text" class="wo-desc" placeholder="Description" style="width:100%;" /></td>
      <td><input type="number" class="wo-qty" value="1" min="0" step="any" style="width:60px;" /></td>
      <td><input type="text" class="wo-unit" value="nos" style="width:60px;" /></td>
      <td><input type="number" class="wo-rate" value="0" min="0" step="any" style="width:100px;" /></td>
      <td class="wo-amount" style="text-align:right;">${moneyValue(0)}</td>
      <td><button type="button" class="wo-remove-btn" style="color:var(--danger);">&times;</button></td>
    `;
    tbodyRef.appendChild(row);
  }

  return item;
}

/** Recalculate totals from line items */
export function recalcWorkOrderTotal(
  items: WorkOrderLineItem[]
): { items: WorkOrderLineItem[]; subtotal: number } {
  let subtotal = 0;
  const updated = items.map((it) => {
    const amount = roundMoney(it.quantity * it.rate);
    subtotal += amount;
    return { ...it, amount };
  });
  return { items: updated, subtotal: roundMoney(subtotal) };
}

/** Format a work order description from line items */
export function formatWorkOrderDescription(items: WorkOrderLineItem[]): string {
  if (!items.length) return "";
  return items
    .map(
      (it) =>
        `${it.description} (${it.quantity} ${it.unit} @ ${moneyValue(it.rate)})`
    )
    .join("\n");
}

/** Parse line items from a description string (reverse) */
export function parseWorkOrderDescription(desc: string): WorkOrderLineItem[] {
  if (!desc) return [];
  /* Simple parsing — each line = one item */
  return desc.split("\n").map((line, idx) => ({
    id: `wo-parsed-${idx}`,
    description: line.replace(/\s*\(.*?\)\s*$/, "").trim(),
    quantity: 1,
    unit: "nos",
    rate: 0,
    amount: 0,
  }));
}

/* ─── Vendor dropdown population ─── */

export function populateWorkOrderDropdown(
  vendors: Vendor[]
): Array<{ value: string; label: string }> {
  const activeVendors = vendors.filter((v) => v.archived !== "Yes");
  return activeVendors.map((v) => ({
    value: v.vendorId,
    label: `${v.company} (${v.trade}) — ${v.contactName || "No contact"}`,
  }));
}

/** Get vendor label by ID */
export function getVendorLabelById(vendorId: string): string {
  const vendors = (getCache("vendors") || []) as Vendor[];
  const v = vendors.find((ven) => ven.vendorId === vendorId);
  if (!v) return vendorId;
  return `${v.company} (${v.trade})`;
}

/* ─── Status helpers ─── */

export const WORK_ORDER_STATUSES = [
  { value: "Draft", label: "Draft" },
  { value: "Issued", label: "Issued" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Invoiced", label: "Invoiced" },
  { value: "Paid", label: "Paid" },
  { value: "Cancelled", label: "Cancelled" },
];

export function getWorkOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Draft: "#6c757d",
    Issued: "#0056b3",
    "In Progress": "#f0ad4e",
    Completed: "#5cb85c",
    Invoiced: "#5bc0de",
    Paid: "#28a745",
    Cancelled: "#d9534f",
  };
  return colors[status] || "#6c757d";
}
