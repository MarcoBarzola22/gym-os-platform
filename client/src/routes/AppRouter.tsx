import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../features/admin/pages/DashboardPage";
import ScannerPage from "../features/access/pages/ScannerPage";
import ClientHomePage from "../features/client/pages/ClientHomePage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Cliente (Celular) */}
        <Route path="/app" element={<ClientHomePage />} />
        
        {/* Rutas Admin (Gimnasio) */}
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        
        {/* Default */}
        <Route path="/" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
};