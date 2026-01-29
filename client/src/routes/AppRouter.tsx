import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importamos solo lo que NECESITAMOS
import DashboardPage from "@/features/admin/pages/DashboardPage";
import ClientHomePage from "@/features/client/pages/ClientHomePage";
import ScannerPage from "@/features/access/pages/ScannerPage"; // Opcional, por si queremos pantalla completa
// import LoginPage from "@/features/auth/pages/LoginPage"; // (Descomentar cuando creemos el Login)

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTA 1: EL CLIENTE (HOME) --- */}
        {/* Aquí entrará el socio con su celular */}
        <Route path="/" element={<ClientHomePage />} />

        {/* --- RUTA 2: EL GIMNASIO (ADMIN) --- */}
        {/* Aquí entra el recepcionista */}
        <Route path="/admin" element={<DashboardPage />} />

        {/* --- RUTA 3: ESCÁNER DEDICADO (Opcional) --- */}
        {/* Por si quieren usar un celu exclusivo como cámara */}
        <Route path="/scanner" element={<ScannerPage />} />

        {/* --- RUTA 4: LOGIN (Próximamente) --- */}
        {/* <Route path="/login" element={<LoginPage />} /> */}

        {/* CUALQUIER OTRA COSA -> Mandar al Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};