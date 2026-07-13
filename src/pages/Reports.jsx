import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Reports() {
  const { cache } = useApp();
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [scope, setScope] = useState("all");
  const [filterId, setFilterId] = useState("");
  const [includeSignature, setIncludeSignature] = useState(true);
  const [orientation, setOrientation] = useState("portrait");

  const projects = useMemo(() => cache.projects || [], [cache.projects]);
  const vendors = useMemo(() => cache.vendors || [], [cache.vendors]);

  useEffect(() => {
    if (type === "financial_all") setScope("all");
    else if (type === "financial_project") setScope("project");
    else if (type === "financial_client") setScope("client");
    else if (type === "financial_vendor") setScope("vendor");
    else setScope("all");
  }, [type]);

  const filterOptions = useMemo(() => {
    if (scope === "project") return projects;
    if (scope === "client") return [...new Map(projects.map((p) => [p.clientName, p])).values()];
    if (scope === "vendor") return vendors;
    return [];
  }, [scope, projects, vendors]);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-2">
        <h3 style={{ margin: 0 }}><i className="fas fa-chart-bar"></i> Reports</h3>
        <button className="action-btn" style={{ width: "auto", padding: "6px 12px", fontSize: 12, background: "var(--card-light)", color: "var(--text)" }} onClick={() => navigate("/print-layouts")}>
          <i className="fas fa-paint-brush"></i> Layouts
        </button>
      </div>

      <label>Report Type</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">-- Select Report --</option>
        <option value="financial_all">Financial Summary (All Projects)</option>
        <option value="financial_project">Financial Report (Project)</option>
        <option value="financial_client">Financial Report (Client)</option>
        <option value="financial_vendor">Financial Report (Vendor)</option>
        <option value="scope">Project Scope</option>
        <option value="snags">Snags Report</option>
        <option value="progress">Progress Report</option>
        <option value="pcr">Project Completion Report (PCR)</option>
        <option value="takeoff">Take-Off Report</option>
        <option value="workorder_report">Work Orders</option>
      </select>

      <label>Scope</label>
      <select value={scope} onChange={(e) => { setScope(e.target.value); setFilterId(""); }}>
        <option value="all">All Projects</option>
        <option value="project">Specific Project</option>
        <option value="client">Specific Client</option>
        <option value="vendor">Specific Vendor</option>
      </select>

      {scope !== "all" && filterOptions.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <label>Select {scope === "project" ? "Project" : scope === "client" ? "Client" : "Vendor"}</label>
          <select value={filterId} onChange={(e) => setFilterId(e.target.value)}>
            <option value="">-- Select --</option>
            {filterOptions.map((opt) => (
              <option key={opt.projectId || opt.vendorId || opt.clientName} value={opt.projectId || opt.vendorId || opt.clientName}>
                {opt.clientName || opt.company || opt.projectId}
              </option>
            ))}
          </select>
        </div>
      )}

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontWeight: 800 }}>
        <input type="checkbox" checked={includeSignature} onChange={(e) => setIncludeSignature(e.target.checked)} style={{ width: "auto" }} />
        Include signature block
      </label>

      <label style={{ marginTop: 10 }}>Paper Orientation</label>
      <select value={orientation} onChange={(e) => setOrientation(e.target.value)}>
        <option value="portrait">Portrait (A4)</option>
        <option value="landscape">Landscape (A4)</option>
      </select>

      <button className="action-btn" style={{ marginTop: 12 }} onClick={() => alert("Report generation will be wired in next batch.")}>
        <i className="fas fa-file-alt"></i> Generate Report
      </button>
    </div>
  );
}