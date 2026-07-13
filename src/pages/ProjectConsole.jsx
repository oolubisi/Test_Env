import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { callApi } from "../api/api.js";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "scope", label: "Scope" },
  { id: "takeoff", label: "Take‑Off" },
  { id: "progress", label: "Progress" },
  { id: "snags", label: "Snags" },
  { id: "workorders", label: "Work Orders" },
  { id: "payments", label: "Payments" },
  { id: "variations", label: "Variations" },
  { id: "pcr", label: "PCR" },
  { id: "photos", label: "Photos" },
];

function fmtN(n) {
  return "₦" + (Number(n) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProjectConsole() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { cache, setCache, setCurrentProjectId } = useApp();
  const [activeTab, setActiveTab] = useState("profile");
  const [scopeEdit, setScopeEdit] = useState(false);
  const [scopeText, setScopeText] = useState("");

  useEffect(() => {
    setCurrentProjectId(projectId);
  }, [projectId, setCurrentProjectId]);

  const project = useMemo(() => (cache.projects || []).find((p) => p.projectId === projectId), [cache.projects, projectId]);

  useEffect(() => {
    if (project?.scope) setScopeText(project.scope);
  }, [project?.scope]);

  if (!project) return <div className="card">Project not found.</div>;

  const vatRate = 0.075;
  const whtRate = 0.05;
  const subtotal = Number(project.contractSubtotal) || 0;
  const vat = subtotal * vatRate;
  const wht = subtotal * whtRate;
  const total = subtotal + vat;
  const net = total - wht;

  const saveScope = async () => {
    try {
      await callApi("updateProjectScope", { projectId, scope: scopeText });
      setCache((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => p.projectId === projectId ? { ...p, scope: scopeText, lastModified: Date.now() } : p),
      }));
      setScopeEdit(false);
    } catch (e) { alert("Failed: " + e.message); }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 10, paddingBottom: 10 }}>
        <div>
          <button className="home-btn" onClick={() => navigate("/")}><i className="fas fa-arrow-left"></i></button>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{project.clientName}</div>
          <button style={{ background: "none", border: "none", fontSize: 12 }} onClick={() => alert("Edit project modal coming in next batch.")}>
            <i className="fas fa-edit"></i> Edit Project
          </button>
        </div>
      </div>

      <div className="console-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`console-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="card">
          <div><strong>Client:</strong> {project.clientName}</div>
          <div><strong>Location:</strong> {project.siteLocation}</div>
          <div><strong>Phone:</strong> <a href={`tel:${project.clientPhone}`}>{project.clientPhone}</a></div>
          <div><strong>Notes:</strong><textarea rows={3} readOnly value={project.notes || ""} style={{ background: "#f5f5f5", marginTop: 4 }} /></div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div className="flex justify-between mb-2"><span>Contract Subtotal</span><strong>{fmtN(subtotal)}</strong></div>
            <div className="flex justify-between mb-2" style={{ color: "var(--muted)" }}><span>VAT ({(vatRate*100).toFixed(1)}%)</span><span>{fmtN(vat)}</span></div>
            <div className="flex justify-between mb-2" style={{ color: "var(--muted)" }}><span>WHT ({(whtRate*100).toFixed(1)}%)</span><span>{fmtN(wht)}</span></div>
            <div className="flex justify-between" style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border)" }}>
              <strong>Total Contract Value</strong><strong>{fmtN(total)}</strong>
            </div>
            <div className="flex justify-between" style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>
              <span>Net Receivable (after WHT)</span><span>{fmtN(net)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "scope" && (
        <div className="card">
          <div className="flex justify-between items-center">
            <strong>Project Scope</strong>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              <input type="checkbox" checked={scopeEdit} onChange={(e) => setScopeEdit(e.target.checked)} style={{ width: "auto" }} />
              Edit
            </label>
          </div>
          <textarea rows={8} readOnly={!scopeEdit} value={scopeText} onChange={(e) => setScopeText(e.target.value)} style={{ background: scopeEdit ? "#fff" : "#f5f5f5", marginTop: 8 }} />
          {scopeEdit && <button className="action-btn" style={{ marginTop: 10 }} onClick={saveScope}><i className="fas fa-save"></i> Save Scope</button>}
        </div>
      )}

      {activeTab !== "profile" && activeTab !== "scope" && (
        <div className="card" style={{ color: "var(--muted)" }}>
          <strong>{TABS.find((t) => t.id === activeTab)?.label}</strong> tab content will be wired in the next batch.
        </div>
      )}
    </div>
  );
}