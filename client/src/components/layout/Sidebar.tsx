import { LayoutDashboard, ScanLine, Users, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    icon: LayoutDashboard,
    label: "Panel Principal",
    href: "/admin",
  },
  {
    icon: Users,
    label: "Listado de Socios",
    href: "/admin/members", // Ojo: A futuro crearemos esta ruta si quieres ver solo la tabla
  },
  {
    icon: ScanLine,
    label: "Escáner Manual",
    href: "/scanner",
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-full flex-col bg-slate-900 text-white shadow-xl">
      
      {/* 1. HEADER / LOGO */}
      <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-900/20">
          G
        </div>
        <div className="flex flex-col">
          <span className="font-bold tracking-wide text-lg text-white">GymOS</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Panel Admin
          </span>
        </div>
      </div>

      {/* 2. MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 space-y-2 px-3 py-6">
        <div className="px-3 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu Principal
          </span>
        </div>
        
        {sidebarItems.map((item) => {
          // Detectar si estamos en esta ruta
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20 translate-x-1"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 3. FOOTER (Usuario Logueado) */}
      <div className="border-t border-slate-800 p-4 mt-auto">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/50">
          {/* Avatar con iniciales */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            AD
          </div>
          
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-white">
              Administrador
            </span>
            <span className="truncate text-xs text-slate-400">
              admin@gym.com
            </span>
          </div>
          
          <LogOut className="ml-auto h-4 w-4 text-slate-500 hover:text-red-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}