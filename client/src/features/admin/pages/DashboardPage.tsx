import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchBar } from "@/features/admin/components/SearchBar";
import { MemberTable } from "@/features/admin/components/MemberTable";
import { MemberDetailModal } from "@/features/admin/components/MemberDetailModal";
import { CreateMemberModal } from "@/features/admin/components/CreateMemberModal"; // <--- 1. IMPORTAR MODAL
import { DashboardScanner } from "../components/DashboardScanner";
import { Button } from "@/components/ui/button"; // <--- 2. IMPORTAR BOTON
import { Plus } from "lucide-react"; // <--- 3. IMPORTAR ICONO
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
  
  // --- ESTADOS DE LOS MODALES ---
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false); // <--- ESTADO PARA ABRIR MODAL

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

  useEffect(() => {
    fetchUsers();
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
    <div className="min-h-screen bg-slate-50 relative flex">
      {/* Sidebar fijo */}
      <div className="fixed left-0 top-0 h-full w-64 z-50 hidden md:block shadow-xl">
        <Sidebar />
      </div>

      {/* Contenido principal empujado a la derecha */}
      <main className="flex-1 md:pl-64 w-full transition-all">
        <div className="container mx-auto p-6 space-y-8">
          
          {/* --- HEADER CON BOTÓN DE CREAR --- */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Panel de Recepción
              </h1>
              <p className="text-slate-500 mt-1">
                Gestiona el acceso y los pagos
              </p>
            </div>
            
            {/* 👇 EL BOTÓN QUE TE FALTA 👇 */}
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 px-6 h-12 text-md transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              NUEVO SOCIO
            </Button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="🔍 Buscar por DNI..."
            />
          </div>

          {/* --- GRID PRINCIPAL: TABLA + ESCÁNER --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna Izquierda (Tabla) - Ocupa 2/3 del espacio */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
               {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p>Cargando socios...</p>
                  </div>
               ) : (
                  <MemberTable 
                    members={filteredMembers} 
                    onMemberClick={handleMemberClick} 
                  />
               )}
            </div>

            {/* Columna Derecha (Cámara) - Ocupa 1/3 del espacio */}
            <div className="lg:col-span-1 h-[500px]"> 
               <DashboardScanner /> 
            </div>

          </div>

          {/* --- MODALES --- */}
          <MemberDetailModal
            member={selectedMember}
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
          />
          
          {/* 👇 AQUÍ SE RENDERIZA EL MODAL DE CREAR 👇 */}
          <CreateMemberModal 
            open={createModalOpen} 
            onOpenChange={setCreateModalOpen}
            onSuccess={() => fetchUsers()} // Recargar tabla al guardar
          />

        </div>
      </main>
    </div>
  );
}