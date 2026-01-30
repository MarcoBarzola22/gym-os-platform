import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "@/features/admin/pages/DashboardPage";
import ClientHomePage from "@/features/client/pages/ClientHomePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import ScannerPage from "@/features/access/pages/ScannerPage";

// --- GUARDIA DE SOCIOS (Ya lo tenías) ---
const ProtectedClientRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem("gym_user");
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// --- NUEVO: GUARDIA DE ADMINS 👮‍♂️ ---
const ProtectedAdminRoute = ({ children }: { children: JSX.Element }) => {
  const userString = localStorage.getItem("gym_user");
  
  // 1. Si no está logueado -> Al Login
  if (!userString) return <Navigate to="/login" replace />;
  
  const user = JSON.parse(userString);

  // 2. Si está logueado pero NO es ADMIN -> Al Home de Cliente
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // 3. Pase, jefe.
  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta Cliente (Cualquiera logueado entra) */}
        <Route 
          path="/" 
          element={
            <ProtectedClientRoute>
              <ClientHomePage />
            </ProtectedClientRoute>
          } 
        />

        {/* Ruta Admin (SOLO ADMINS) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <DashboardPage />
            </ProtectedAdminRoute>
          } 
        />
        
        {/* Rutas extra */}
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};