import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { syncQueuedRequests, getPendingCount } from "../api/api.js";

const NAV = [
  { id: "dashboard", label: "Projects", icon: "fa-chart-line", path: "/" },
  { id: "vendors", label: "Vendors", icon: "fa-truck", path: "/vendors" },
  { id: "accounts", label: "Accounts", icon: "fa-file-invoice-dollar", path: "/accounts" },
  { id: "reports", label: "Reports", icon: "fa-file-alt", path: "/reports" },
  { id: "calculators", label: "Calculators", icon: "fa-calculator", path: "/calculators" },
  { id: "print-layouts", label: "Print Layouts", icon: "fa-print", path: "/print-layouts" },
  { id: "settings", label: "Settings", icon: "fa-gear", path: "/settings" },
];

export default function Layout({ children }) {
  const { syncStatus, updateSync } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getPendingCount().then(setPending);
  }, [syncStatus]);

  useEffect(() => {
    const handler = (e) => {
      const { message, duration } = e.detail;
      setToast({ message, duration });
      setTimeout(() => setToast(null), duration);
    };
    window.addEventListener("fs-toast", handler);
    return () => window.removeEventListener("fs-toast", handler);
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine) {
      alert("You are offline. Please connect to internet.");
      return;
    }
    await syncQueuedRequests(() => getPendingCount().then(setPending));
    updateSync(pending);
  };

  const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <nav className="desktop-sidebar">
        <div className="sidebar-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <img src="/fieldscan.png" alt="FieldScan" className="sidebar-logo" />
          <h2>FieldScan<span style={{ fontWeight: 400 }}> Pro</span></h2>
        </div>
        <div className="sidebar-nav">
          {NAV.map((n) => (
            <Link
              key={n.id}
              to={n.path}
              className={`segment-btn ${isActive(n.path) ? "nav-active" : ""}`}
            >
              <i className={`fas ${n.icon}`}></i> {n.label}
            </Link>
          ))}
          <button className="segment-btn sync-btn" onClick={handleSync}>
            <i className="fas fa-sync-alt"></i> Sync Now
            {pending > 0 && <span className="sync-count-badge">{pending}</span>}
          </button>
          <button className="segment-btn" onClick={() => window.location.reload()}>
            <i className="fas fa-database"></i> Refresh
          </button>
        </div>
      </nav>

      <main className="main">
        {/* Mobile Header — hidden on desktop via CSS */}
        <div className="mobile-header">
          <div className="page-header">
            <div className="header-group">
              <button className="home-btn" onClick={() => navigate("/")}>
                <i className="fas fa-home"></i>
              </button>
              <h2>FieldScan<span style={{ fontWeight: 400 }}> Pro</span></h2>
            </div>
            <div
              id="sync-status"
              onClick={handleSync}
              style={{
                background: "#000",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 800,
                display: syncStatus.online && pending === 0 ? "none" : "block",
                cursor: "pointer",
              }}
            >
              {!syncStatus.online ? `Offline • ${pending} pending` : `${pending} pending`}
            </div>
          </div>

          <div className="segment-bar">
            {NAV.map((n) => (
              <Link
                key={n.id}
                to={n.path}
                className={`segment-btn ${isActive(n.path) ? "nav-active" : ""}`}
              >
                <i className={`fas ${n.icon}`}></i> {n.label}
              </Link>
            ))}
            <button className="segment-btn sync-btn" onClick={handleSync}>
              <i className="fas fa-sync-alt"></i> Sync Now
              {pending > 0 && <span className="sync-count-badge">{pending}</span>}
            </button>
            <button className="segment-btn" onClick={() => window.location.reload()}>
              <i className="fas fa-database"></i> Refresh
            </button>
          </div>
        </div>

        {children}

        {toast && (
          <div className="sync-toast">{toast.message}</div>
        )}
      </main>
    </div>
  );
}