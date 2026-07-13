import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Vendors from "./pages/Vendors.jsx";
import Accounts from "./pages/Accounts.jsx";
import Reports from "./pages/Reports.jsx";
import Calculators from "./pages/Calculators.jsx";
import Settings from "./pages/Settings.jsx";
import PrintLayouts from "./pages/PrintLayouts.jsx";
import ProjectConsole from "./pages/ProjectConsole.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/print-layouts" element={<PrintLayouts />} />
        <Route path="/project/:projectId" element={<ProjectConsole />} />
      </Routes>
    </Layout>
  );
}