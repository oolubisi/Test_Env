import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { callApi } from "../api/api.js";
import Modal from "../components/Modal.jsx";

export default function Dashboard() {
  const { cache, setCache } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ clientName: "", siteLocation: "", clientPhone: "", clientEmail: "", scope: "", notes: "" });

  useEffect(() => {
    if (!cache.projects?.length) {
      callApi("getProjects", {}).then((res) => {
        setCache((prev) => ({ ...prev, projects: res || [] }));
      }).catch(() => {});
    }
  }, [cache.projects?.length, setCache]);

  const projects = useMemo(() => {
    const list = cache.projects || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((p) =>
      (p.clientName || "").toLowerCase().includes(q) ||
      (p.projectId || "").toLowerCase().includes(q)
    );
  }, [cache.projects, search]);

  const handleSave = async () => {
    if (!form.clientName.trim()) return alert("Client name is required");
    try {
      const res = await callApi("saveProject", { ...form, contractSubtotal: 0 });
      const newProject = { ...form, projectId: res.projectId, contractSubtotal: 0, lastModified: Date.now() };
      setCache((prev) => ({ ...prev, projects: [newProject, ...(prev.projects || [])] }));
      setShowNew(false);
      setForm({ clientName: "", siteLocation: "", clientPhone: "", clientEmail: "", scope: "", notes: "" });
    } catch (e) {
      alert("Failed to save: " + e.message);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4" style={{ flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search client or project ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, fontSize: 16 }}
        />
        <button className="action-btn" style={{ width: "auto", padding: "0 20px" }} onClick={() => setShowNew(true)}>
          <i className="fas fa-plus"></i> New
        </button>
      </div>

      <div>
        {projects.map((p) => (
          <div
            key={p.projectId}
            className="project-card"
            onClick={() => navigate(`/project/${p.projectId}`)}
          >
            <h4>{p.clientName} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 13 }}>— {p.projectId}</span></h4>
            <div className="meta">{p.siteLocation} • {p.projectStatus || "Active"}</div>
          </div>
        ))}
        {projects.length === 0 && <div className="card" style={{ color: "var(--muted)" }}>No projects found.</div>}
      </div>

      <Modal
        isOpen={showNew}
        title="New Project"
        onClose={() => setShowNew(false)}
        footer={
          <>
            <button className="action-btn" style={{ width: "auto", background: "var(--card-light)", color: "var(--text)" }} onClick={() => setShowNew(false)}>Cancel</button>
            <button className="action-btn" style={{ width: "auto" }} onClick={handleSave}><i className="fas fa-save"></i> Save</button>
          </>
        }
      >
        <label>Client Name</label>
        <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
        <label>Site Location</label>
        <input value={form.siteLocation} onChange={(e) => setForm({ ...form, siteLocation: e.target.value })} />
        <label>Client Phone</label>
        <input value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
        <label>Client Email</label>
        <input type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
        <label>Scope</label>
        <textarea rows={3} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} />
        <label>Notes</label>
        <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </Modal>
    </div>
  );
}