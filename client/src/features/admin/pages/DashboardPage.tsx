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
    // 1. Agregamos 'flex' para que se pongan lado a lado
    <div className="min-h-screen bg-background flex">
      
      {/* El Sidebar se queda quieto a la izquierda */}
      <Sidebar />

      {/* 2. IMPORTANTE: Agregamos 'w-full' y un margen/padding si el Sidebar es fijo.
          Si tu Sidebar es 'fixed', el 'flex' no basta. 
          Prueba agregando 'pl-64' (padding-left) o 'ml-64' si se sigue viendo montado. */}
      <main className="flex-1 w-full overflow-y-auto bg-slate-50/50">
        <div className="container mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Panel de Recepción
              </h1>
              <p className="text-slate-500">
                Gestiona el acceso y los pagos de los socios
              </p>
            </div>
            {/* Aquí pondremos el botón de crear usuario en la Fase 3 */}
            <div className="bg-white px-4 py-2 rounded-lg border text-sm font-medium shadow-sm">
              📅 {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* ... El resto de tu buscador y tabla ... */}
          <div className="mb-10">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Buscar socio por DNI o Nombre..."
            />
          </div>

          <div className="mb-6">
             {/* ... Tu lógica de isLoading y Tabla ... */}
             {isLoading ? (
                <div className="text-center py-10">Cargando...</div>
             ) : (
                <MemberTable 
                  members={filteredMembers} 
                  onMemberClick={handleMemberClick} 
                />
             )}
          </div>

          {/* Modal */}
          <MemberDetailModal
            member={selectedMember}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        </div>
      </main>
    </div>
  );
}