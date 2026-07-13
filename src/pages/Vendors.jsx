import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { callApi } from "../api/api.js";
import Modal from "../components/Modal.jsx";

export default function Vendors() {
  const { cache, setCache } = useApp();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ company: "", trade: "", contactName: "", phone1: "", phone2: "", email: "" });

  useEffect(() => {
    if (!cache.vendors?.length) {
      callApi("getVendors", {}).then((res) => setCache((prev) => ({ ...prev, vendors: res || [] }))).catch(() => {});
    }
  }, [cache.vendors?.length, setCache]);

  const list = useMemo(() => {
    const items = cache.vendors || [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((v) => (v.company || "").toLowerCase().includes(q) || (v.trade || "").toLowerCase().includes(q));
  }, [cache.vendors, search]);

  const handleSave = async () => {
    if (!form.company.trim()) return alert("Company name is required");
    try {
      const res = await callApi("saveVendor", { ...form, vendorId: "VND-" + Date.now() });
      const newItem = { ...form, vendorId: res.vendorId || "VND-" + Date.now(), lastModified: Date.now() };
      setCache((prev) => ({ ...prev, vendors: [newItem, ...(prev.vendors || [])] }));
      setShowNew(false);
      setForm({ company: "", trade: "", contactName: "", phone1: "", phone2: "", email: "" });
    } catch (e) {
      alert("Failed to save: " + e.message);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4" style={{ flexWrap: "wrap" }}>
        <input type="text" placeholder="Search vendor..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 2, fontSize: 16 }} />
        <select style={{ flex: 1, fontSize: 16 }}><option value="">All Trades</option></select>
        <button className="action-btn" style={{ width: "auto", padding: "0 20px" }} onClick={() => setShowNew(true)}><i className="fas fa-plus"></i> Add</button>
      </div>
      {list.map((v) => (
        <div key={v.vendorId} className="project-card">
          <h4>{v.company}</h4>
          <div className="meta">{v.trade} • {v.contactName} • {v.phone1}</div>
        </div>
      ))}
      {list.length === 0 && <div className="card" style={{ color: "var(--muted)" }}>No vendors found.</div>}

      <Modal isOpen={showNew} title="Add Vendor" onClose={() => setShowNew(false)}
        footer={<>
          <button className="action-btn" style={{ width: "auto", background: "var(--card-light)", color: "var(--text)" }} onClick={() => setShowNew(false)}>Cancel</button>
          <button className="action-btn" style={{ width: "auto" }} onClick={handleSave}><i className="fas fa-save"></i> Save</button>
        </>}>
        <label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <label>Trade</label><input value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} />
        <label>Contact Name</label><input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        <label>Phone 1</label><input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
        <label>Phone 2</label><input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
        <label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Modal>
    </div>
  );
}