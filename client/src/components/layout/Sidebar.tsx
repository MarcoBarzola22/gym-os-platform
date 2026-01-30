import { NavLink } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="h-full w-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      
      {/* LOGO */}
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
          <span className="text-white font-bold text-lg">G</span>
        </div>
        <span className="text-white font-bold text-xl tracking-tight">GymOS</span>
      </div>

      {/* MENÚ PRINCIPAL */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Panel de Control
        </p>
        
        {/* Único enlace necesario por ahora */}
        <NavLink 
          to="/admin"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"}
          `}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium text-sm">Recepción</span>
        </NavLink>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-800">
        <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 pl-4 gap-3"
            onClick={() => window.location.href = '/login'} // Salir simple
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </Button>
      </div>
    </aside>
  );
}