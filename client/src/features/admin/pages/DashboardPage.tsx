import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchBar } from "@/features/admin/components/SearchBar";
import { MemberTable } from "@/features/admin/components/MemberTable";
import { MemberDetailModal } from "@/features/admin/components/MemberDetailModal";
import { CreateMemberModal } from "@/features/admin/components/CreateMemberModal"; 
import { DashboardScanner } from "../components/DashboardScanner";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { toast } from "sonner";

export interface Member {
  id: string;
  name: string;
  dni: string;
  photo: string;
  status: "active" | "expired";
  expirationDate: string;
  streak: number;
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false); 

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

  useEffect(() => { fetchUsers(); }, []);

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
          
          {/* --- HEADER LIMPIO --- */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel de Recepción</h1>
              <p className="text-slate-500 text-sm mt-1">Viernes, 29 de Enero</p>
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
          {/* Le quitamos el fondo blanco para que flote en el gris */}
          <div className="max-w-md">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="🔍 Buscar socio por DNI o Nombre..."
            />
          </div>

          {/* --- GRID PRINCIPAL --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* TABLA (Ocupa 2 espacios) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[500px]">
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

            {/* CÁMARA (Ocupa 1 espacio) */}
            <div className="lg:col-span-1 h-auto"> 
               <DashboardScanner /> 
               
               {/* Un widget extra de estadísticas rápidas debajo de la cámara */}
               <div className="mt-6 bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/20">
                  <p className="text-blue-100 text-sm font-medium mb-1">Socios Activos</p>
                  <p className="text-4xl font-bold">{members.filter(m => m.status === 'active').length}</p>
                  <div className="mt-4 text-xs text-blue-200 bg-blue-500/30 inline-block px-2 py-1 rounded-lg">
                    +2 hoy
                  </div>
               </div>
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