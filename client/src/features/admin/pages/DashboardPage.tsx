import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchBar } from "@/features/admin/components/SearchBar";
import { MemberTable } from "@/features/admin/components/MemberTable";
import { MemberDetailModal } from "@/features/admin/components/MemberDetailModal";
import { CreateMemberModal } from "@/features/admin/components/CreateMemberModal"; 
import { DashboardScanner } from "../components/DashboardScanner";
import { Button } from "@/components/ui/button";
import { Plus, Bell, History } from "lucide-react";
import { toast } from "sonner";

export interface Member {
  id: string;
  name: string;
  dni: string;
  photo: string;
  status: "active" | "expired";
  expirationDate: string;
  rawExpiration: string;
  lastPaymentDate: string;
  streak: number;
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false); 
  const [logs, setLogs] = useState([]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/users");
      const mappedMembers = data.map((u: any) => ({
        id: u.id.toString(),
        name: u.fullName || "Sin Nombre",
        dni: u.dni,
        photo: u.photoUrl || `https://ui-avatars.com/api/?name=${u.fullName}&background=random`,
        status: u.isActive ? "active" : "expired",
        expirationDate: new Date(u.expirationDate || Date.now()).toLocaleDateString(),
        rawExpiration: u.expirationDate || new Date().toISOString(),
        lastPaymentDate: u.lastPaymentDate ? new Date(u.lastPaymentDate).toLocaleDateString() : "Sin pagos",
        streak: 0 
      }));
      setMembers(mappedMembers);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    api.get("/access/logs").then(({ data }) => setLogs(data)).catch(() => {});
  }, []);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.dni.includes(searchQuery)
  );

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR FIJO */}
      <div className="fixed left-0 top-0 h-full w-64 z-50 hidden md:block">
        <Sidebar />
      </div>

      {/* CONTENIDO */}
      <main className="flex-1 md:pl-64 w-full">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel de Recepción</h1>
              <p className="text-slate-500 text-sm mt-1">Gestión de Socios</p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-full bg-white border-slate-200 text-slate-500">
                <Bell size={20} />
              </Button>
              <Button 
                onClick={() => setCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 rounded-full px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Socio
              </Button>
            </div>
          </div>

          {/* --- BUSCADOR --- */}
          <div className="max-w-md">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="🔍 Buscar socio por DNI o Nombre..."
            />
          </div>

          {/* --- GRID PRINCIPAL --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA (TABLAS) - Ocupa 2 espacios */}
            <div className="lg:col-span-2 space-y-6">
               
               {/* 1. TABLA DE SOCIOS */}
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[500px]">
                  {isLoading ? (
                     <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                       <p className="text-sm">Cargando base de datos...</p>
                     </div>
                  ) : (
                     <MemberTable 
                       members={filteredMembers} 
                       onMemberClick={handleMemberClick} 
                     />
                  )}
               </div>

               {/* 2. TABLA DE ÚLTIMOS INGRESOS (Movida aquí para simetría) */}
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="text-slate-400 w-5 h-5" />
                    <h2 className="text-lg font-bold text-slate-700">Últimos Ingresos</h2>
                  </div>
                  
                  <div className="overflow-auto max-h-[300px]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                          <th className="pb-3 pl-2">Hora</th>
                          <th className="pb-3">Socio</th>
                          <th className="pb-3">DNI</th>
                          <th className="pb-3 text-center">Acceso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {logs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 pl-2 text-slate-500 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3 font-medium text-slate-700">{log.user?.fullName}</td>
                            <td className="py-3 text-slate-400">{log.user?.dni}</td>
                            <td className="py-3 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                log.status === 'GRANTED' 
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                  : 'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}>
                                {log.status === 'GRANTED' ? 'Permitido' : 'Rechazado'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {logs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-slate-400 italic">
                              No hay registros de ingreso hoy.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>

            </div>

            {/* COLUMNA DERECHA (WIDGETS) - Ocupa 1 espacio */}
            <div className="lg:col-span-1 space-y-6"> 
               {/* CÁMARA */}
               <DashboardScanner /> 
               
               {/* KPI SOCIOS ACTIVOS */}
               <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-blue-100 text-sm font-medium mb-1 uppercase tracking-wider">Socios Activos</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl font-bold">{members.filter(m => m.status === 'active').length}</p>
                      <span className="text-blue-200 text-lg">/ {members.length}</span>
                    </div>
                  </div>
                  {/* Decoración de fondo */}
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
               </div>

               {/* Aquí podrías agregar más widgets a futuro (ej: Recaudación del mes) */}
            </div>

          </div>

          {/* --- MODALES --- */}
          <MemberDetailModal member={selectedMember} open={detailModalOpen} onOpenChange={setDetailModalOpen} />
          <CreateMemberModal open={createModalOpen} onOpenChange={setCreateModalOpen} onSuccess={() => fetchUsers()} />

        </div>
      </main>
    </div>
  );
}