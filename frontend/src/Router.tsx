import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { App } from "./App";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main logistics app */}
        <Route path="/" element={<App />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Redirect /admin to /admin/login */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
