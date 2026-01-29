import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 1. Importamos las páginas
import DashboardPage from "@/features/admin/pages/DashboardPage";
import ClientHomePage from "@/features/client/pages/ClientHomePage";
import LoginPage from "@/features/auth/pages/LoginPage"; // <--- La que acabamos de crear
import ScannerPage from "@/features/access/pages/ScannerPage";

// 2. Componente para proteger la ruta del cliente
// Si no tiene datos guardados, lo manda al Login
const ProtectedClientRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem("gym_user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTA 1: LOGIN (Pública) --- */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- RUTA 2: CLIENTE (Protegida) --- */}
        {/* Solo entra si ya se logueó antes */}
        <Route 
          path="/" 
          element={
            <ProtectedClientRoute>
              <ClientHomePage />
            </ProtectedClientRoute>
          } 
        />

        {/* --- RUTA 3: ADMIN (Pública por ahora) --- */}
        <Route path="/admin" element={<DashboardPage />} />

        {/* --- EXTRAS --- */}
        <Route path="/scanner" element={<ScannerPage />} />
        
        {/* Cualquier ruta desconocida -> Mandar al Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};