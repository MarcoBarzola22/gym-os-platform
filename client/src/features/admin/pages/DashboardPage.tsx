import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchBar } from "@/features/admin/components/SearchBar";
import { MemberTable } from "@/features/admin/components/MemberTable";
import { MemberDetailModal } from "@/features/admin/components/MemberDetailModal";
import { CreateMemberModal } from "@/features/admin/components/CreateMemberModal"; // <--- Tu nuevo modal
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

// Definimos la interfaz del Socio
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
  // --- ESTADOS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de los Modales
  const [selectedMember, setSelectedMember] = useState<Member | null>(null); // Para ver detalles
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false); // Para crear nuevo

  // --- FUNCIÓN DE CARGA DE DATOS ---
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/users");
      
      // Mapeamos los datos del backend a lo que usa el frontend
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
      console.error("Error cargando usuarios:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar al iniciar
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrado local por buscador
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.dni.includes(searchQuery)
  );

  // Manejador para abrir detalles
  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      {/* 1. SIDEBAR FIJO (Izquierda) */}
      <div className="fixed left-0 top-0 h-full w-64 z-50 hidden md:block shadow-xl">
        <Sidebar />
      </div>

      {/* 2. CONTENIDO PRINCIPAL (Derecha) */}
      {/* Usamos md:pl-64 para dejar espacio al sidebar */}
      <main className="md:pl-64 w-full min-h-screen transition-all">
        <div className="container mx-auto p-6 space-y-8">
          
          {/* HEADER Y BOTÓN DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Recepción
              </h1>
              <p className="text-slate-500 mt-1">
                Panel de control y accesos
              </p>
            </div>
            
            {/* BOTÓN + NUEVO SOCIO */}
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 px-6 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Socio
            </Button>
          </div>

          {/* BARRA DE BÚSQUEDA */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="🔍 Buscar por DNI, Nombre o Apellido..."
            />
          </div>

          {/* TABLA DE SOCIOS */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
             {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p>Cargando socios...</p>
                </div>
             ) : (
                <>
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">Listado de Miembros</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      Total: {filteredMembers.length}
                    </span>
                  </div>
                  <MemberTable 
                    members={filteredMembers} 
                    onMemberClick={handleMemberClick} 
                  />
                  {filteredMembers.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                      No se encontraron resultados para "{searchQuery}"
                    </div>
                  )}
                </>
             )}
          </div>

          {/* --- MODALES --- */}
          
          {/* 1. Modal de Detalles (Ver ficha) */}
          <MemberDetailModal
            member={selectedMember}
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
          />
          
          {/* 2. Modal de Creación (Nuevo Socio) */}
          <CreateMemberModal 
            open={createModalOpen} 
            onOpenChange={setCreateModalOpen}
            onSuccess={() => {
              // Recargamos la lista cuando se crea uno exitosamente
              fetchUsers();
            }}
          />

        </div>
      </main>
    </div>
  );
}