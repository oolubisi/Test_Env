import React, { useState } from "react";

const CALC_TYPES = [
  { value: "concrete", label: "Concrete" },
  { value: "blockwork", label: 'Blockwork (6" / 9")' },
  { value: "plastering", label: "Plastering" },
  { value: "piping", label: "Bathroom Piping" },
  { value: "electrical", label: "Low Voltage Electrical" },
  { value: "firealarm", label: "Fire Alarm" },
];

export default function Calculators() {
  const [type, setType] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="flex justify-between items-center">
          <h3 style={{ margin: 0 }}><i className="fas fa-calculator"></i> Calculators</h3>
          <button className="action-btn" style={{ width: "auto", padding: "8px 14px", fontSize: 13, background: "var(--card-light)", color: "var(--text)" }} onClick={() => alert("Constants editor coming in next batch.")}>
            <i className="fas fa-sliders-h"></i> Constants
          </button>
        </div>
      </div>
      <div className="calc-columns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card">
          <label>Calculator Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">-- Select Calculator --</option>
            {CALC_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <div style={{ marginTop: 14, color: "var(--muted)" }}>
            {type ? `Inputs for ${type} will appear here.` : "Select a calculator type to begin."}
          </div>
        </div>
        <div className="card">
          <label>Result (read-only, copyable)</label>
          <textarea rows={14} readOnly value={output} style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }} />
          <button className="action-btn" style={{ marginTop: 10, width: "auto", padding: "10px 22px" }} onClick={() => navigator.clipboard.writeText(output)}>
            <i className="fas fa-copy"></i> Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}