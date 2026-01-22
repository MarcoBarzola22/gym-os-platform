import { useState, useEffect } from "react"; // 1. Importamos useEffect
import { api } from "@/lib/axios";            // 2. Importamos tu api configurada
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchBar } from "@/features/admin/components/SearchBar";
import { MemberTable } from "@/features/admin/components/MemberTable";
import { MemberDetailModal } from "@/features/admin/components/MemberDetailModal";
import { toast } from "sonner"; // Para mostrar errores si falla la carga

// Definimos la interfaz (Ajustada para recibir lo que manda el Backend)
export interface Member {
  id: string; // El backend manda Int, pero aquí lo convertimos o manejamos
  name: string;
  dni: string;
  photo: string;
  status: "active" | "expired";
  expirationDate: string;
  streak: number;
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  // 3. Estado para guardar los socios reales que vienen del backend
  const [members, setMembers] = useState<Member[]>([]); 
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga

  // 4. EL EFECTO MÁGICO: Cargar usuarios al entrar a la página
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/users");
        
        // 5. TRANSFORMACIÓN DE DATOS (IMPORTANTE)
        // El backend probablemente manda: { fullName, photoUrl, isActive, ... }
        // Tu frontend espera: { name, photo, status, ... }
        // Aquí hacemos el "mapeo" para que no se rompa tu tabla.
        
        const mappedMembers = data.map((u: any) => ({
          id: u.id.toString(),
          name: u.fullName || "Sin Nombre",
          dni: u.dni,
          photo: u.photoUrl || "https://github.com/shadcn.png", // Foto por defecto
          status: u.isActive ? "active" : "expired", // Convertimos booleano a string
          expirationDate: new Date(u.expirationDate || Date.now()).toLocaleDateString(),
          streak: 0 // Por ahora hardcodeado, luego lo calculamos
        }));

        setMembers(mappedMembers);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        toast.error("Error al conectar con el servidor");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // El array vacío [] significa "ejecutar solo una vez al iniciar"

  // Filtramos sobre el estado 'members' real, no sobre el mock
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.dni.includes(searchQuery)
  );

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <main className="flex-1 container mx-auto px-4 py-8 overflow-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Panel de Recepción
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestiona el acceso y los pagos de los socios
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar socio por DNI o Nombre..."
          />
        </div>

        {/* Tabla de Socios */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-foreground">
               Socios recientes
             </h2>
             {/* Indicador de cantidad */}
             <span className="text-sm text-muted-foreground bg-slate-100 px-3 py-1 rounded-full">
               Total: {members.length}
             </span>
          </div>

          {isLoading ? (
            // Spinner simple mientras carga
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <MemberTable
              members={filteredMembers}
              onMemberClick={handleMemberClick}
            />
          )}
          
          {!isLoading && filteredMembers.length === 0 && (
             <p className="text-center text-muted-foreground py-10">
               No se encontraron socios.
             </p>
          )}
        </div>

        {/* Member detail modal */}
        <MemberDetailModal
          member={selectedMember}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </main>
    </div>
  );
}