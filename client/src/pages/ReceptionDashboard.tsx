import { useState } from "react";
import { Navigation } from "@/components/gym/Navigation";
import { SearchBar } from "@/components/gym/SearchBar";
import { MemberTable } from "@/components/gym/MemberTable";
import { MemberDetailModal } from "@/components/gym/MemberDetailModal";
import member1 from "@/assets/member-1.jpg";
import member2 from "@/assets/member-2.jpg";
import member3 from "@/assets/member-3.jpg";
import member4 from "@/assets/member-4.jpg";

interface Member {
  id: string;
  name: string;
  dni: string;
  photo: string;
  status: "active" | "expired";
  expirationDate: string;
  streak: number;
}

const mockMembers: Member[] = [
  {
    id: "1",
    name: "Carlos Martínez",
    dni: "12.345.678",
    photo: member1,
    status: "active",
    expirationDate: "15/Oct/2025",
    streak: 5,
  },
  {
    id: "2",
    name: "Laura García",
    dni: "23.456.789",
    photo: member2,
    status: "active",
    expirationDate: "20/Oct/2025",
    streak: 8,
  },
  {
    id: "3",
    name: "Roberto Sánchez",
    dni: "34.567.890",
    photo: member3,
    status: "expired",
    expirationDate: "01/Oct/2025",
    streak: 0,
  },
  {
    id: "4",
    name: "Ana López",
    dni: "45.678.901",
    photo: member4,
    status: "active",
    expirationDate: "25/Oct/2025",
    streak: 12,
  },
];

export default function ReceptionDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredMembers = mockMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.dni.includes(searchQuery)
  );

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
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

        {/* Recent members section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Socios recientes
          </h2>
          <MemberTable
            members={filteredMembers}
            onMemberClick={handleMemberClick}
          />
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
