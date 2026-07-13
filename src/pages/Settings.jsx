import React, { useState, useEffect } from "react";

export default function Settings() {
  const [prefs, setPrefs] = useState({
    workingFolder: "",
    backendUrl: localStorage.getItem("fieldscan_backend_url") || "",
    userEmail: localStorage.getItem("fieldscan_user_email") || "",
    userRole: localStorage.getItem("fieldscan_user_role") || "admin",
  });
  const [backupSummary, setBackupSummary] = useState("");

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("fb_"));
    setBackupSummary(`${keys.length} backup key(s) in localStorage.`);
  }, []);

  const save = () => {
    if (prefs.backendUrl) localStorage.setItem("fieldscan_backend_url", prefs.backendUrl);
    localStorage.setItem("fieldscan_user_email", prefs.userEmail);
    localStorage.setItem("fieldscan_user_role", prefs.userRole);
    alert("Preferences saved.");
  };

  const exportBackup = () => {
    const data = {};
    Object.keys(localStorage).forEach((k) => { data[k] = localStorage.getItem(k); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fieldscan-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const restoreBackup = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
        alert("Backup restored. Reload the page to apply.");
      } catch { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  const clearBackups = () => {
    if (!confirm("Clear all local backups? This cannot be undone.")) return;
    Object.keys(localStorage).forEach((k) => { if (k.startsWith("fb_")) localStorage.removeItem(k); });
    setBackupSummary("0 backup key(s) in localStorage.");
  };

  return (
    <div>
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Preferences</h3>
        <label>Working Folder</label>
        <input value={prefs.workingFolder} onChange={(e) => setPrefs({ ...prefs, workingFolder: e.target.value })} placeholder="/Users/you/Documents/FieldScan" />
        <label>Backend URL</label>
        <input value={prefs.backendUrl} onChange={(e) => setPrefs({ ...prefs, backendUrl: e.target.value })} placeholder="Google Apps Script URL" />
        <label>User Email</label>
        <input type="email" value={prefs.userEmail} onChange={(e) => setPrefs({ ...prefs, userEmail: e.target.value })} />
        <label>Default Role</label>
        <select value={prefs.userRole} onChange={(e) => setPrefs({ ...prefs, userRole: e.target.value })}>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="accountant">Accountant</option>
          <option value="viewer">Viewer</option>
        </select>
        <button className="action-btn" style={{ marginTop: 12 }} onClick={save}><i className="fas fa-save"></i> Save Preferences</button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Data / Backup Manager</h3>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>{backupSummary}</div>
        <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
          <button className="action-btn" style={{ width: "auto" }} onClick={exportBackup}><i className="fas fa-download"></i> Export</button>
          <label className="action-btn" style={{ width: "auto", cursor: "pointer" }}>
            <i className="fas fa-upload"></i> Restore
            <input type="file" accept="application/json" onChange={(e) => { if (e.target.files[0]) restoreBackup(e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />
          </label>
          <button className="action-btn" style={{ width: "auto", background: "var(--danger)" }} onClick={clearBackups}><i className="fas fa-trash"></i> Clear Local Backups</button>
        </div>
      </div>
    </div>
  );
}