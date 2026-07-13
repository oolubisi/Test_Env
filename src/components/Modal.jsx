import React, { useEffect } from "react";

export default function Modal({ isOpen, title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>{title}</h3>
          <span onClick={onClose} style={{ fontSize: 28, cursor: "pointer" }}>&times;</span>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}