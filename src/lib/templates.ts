/* ───────────────────────────────────────────
   Templates — Built-in & custom report templates
   ─────────────────────────────────────────── */

import type { TemplateItem } from "@/types";
import { callApi } from "./api";

const STORAGE_KEY = "fieldscan_custom_templates";

/* ─── Built-in templates ─── */

export function getBuiltInTemplates(): TemplateItem[] {
  return [
    {
      id: "tpl-site-diary",
      name: "Site Diary",
      category: "Daily",
      builtIn: true,
      content: `SITE DIARY — {{PROJECT_NAME}}
Date: {{DATE}}
Weather: {{WEATHER}}

Work Done:
- {{WORK_DONE}}

Visitors on Site:
- {{VISITORS}}

Issues / Delays:
- {{ISSUES}}

Materials Delivered:
- {{MATERIALS}}

Signed: ___________________`,
    },
    {
      id: "tpl-progress-report",
      name: "Progress Report",
      category: "Weekly",
      builtIn: true,
      content: `PROGRESS REPORT — {{PROJECT_NAME}}
Week Ending: {{DATE}}

Overall Completion: {{COMPLETION}}%

Trade Progress:
{{TRADE_PROGRESS}}

Photos:
{{PHOTO_LOG}}

Next Week Plan:
- {{NEXT_PLAN}}

Prepared by: ___________________`,
    },
    {
      id: "tpl-variation-request",
      name: "Variation Request",
      category: "Commercial",
      builtIn: true,
      content: `VARIATION REQUEST — {{PROJECT_NAME}}
Ref: VAR-{{VAR_NUMBER}}
Date: {{DATE}}

Description:
{{DESCRIPTION}}

Reason for Variation:
{{REASON}}

Cost Impact:
{{COST_IMPACT}}

Time Impact:
{{TIME_IMPACT}}

Requested by: ___________________
Approved by: ___________________`,
    },
    {
      id: "tpl-snag-list",
      name: "Snag List",
      category: "Quality",
      builtIn: true,
      content: `SNAG LIST — {{PROJECT_NAME}}
Date Inspected: {{DATE}}

| # | Location | Description | Severity | Assigned | Status |
|---|----------|-------------|----------|----------|--------|
{{SNAG_ROWS}}

Signed by Contractor: ___________________
Signed by Client: ___________________`,
    },
    {
      id: "tpl-payment-cert",
      name: "Payment Certificate",
      category: "Commercial",
      builtIn: true,
      content: `INTERIM PAYMENT CERTIFICATE — {{PROJECT_NAME}}
Certificate No: {{CERT_NUMBER}}
Date: {{DATE}}

Contract Sum: {{CONTRACT_SUM}}
Previous Certified: {{PREVIOUS_CERT}}
This Certificate: {{THIS_CERT}}
Cumulative: {{CUMULATIVE}}

Less Retention ({{RETENTION}}%): {{RETENTION_AMT}}
Net Due: {{NET_DUE}}

Certified by: ___________________`,
    },
  ];
}

/* ─── Custom templates (localStorage) ─── */

export function getCustomTemplates(): TemplateItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveCustomTemplates(
  templates: TemplateItem[],
  syncToSheet = false
): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  if (syncToSheet) {
    syncTemplatesToSheet(templates).catch(console.error);
  }
}

/** Sync custom templates to Google Sheet */
export async function syncTemplatesToSheet(
  templates: TemplateItem[]
): Promise<void> {
  await callApi("saveTemplates", { templates: JSON.stringify(templates) });
}

/** Load custom templates from Google Sheet */
export async function loadTemplatesFromSheet(): Promise<TemplateItem[]> {
  const resp = await callApi("getTemplates");
  if (resp.status === "success" && resp.data) {
    try {
      const parsed =
        typeof resp.data === "string" ? JSON.parse(resp.data) : resp.data;
      const templates = Array.isArray(parsed) ? parsed : [];
      saveCustomTemplates(templates, false);
      return templates;
    } catch {
      return getCustomTemplates();
    }
  }
  return getCustomTemplates();
}

/* ─── Export / Import ─── */

export function exportTemplatesToJson(): string {
  const all = [...getBuiltInTemplates(), ...getCustomTemplates()];
  return JSON.stringify(all, null, 2);
}

export function importTemplatesFromJson(json: string): TemplateItem[] {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Invalid template file");
  const custom = parsed.filter((t: TemplateItem) => !t.builtIn);
  saveCustomTemplates(custom, true);
  return custom;
}

/* ─── Template variable substitution ─── */

export function fillTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || "");
}
