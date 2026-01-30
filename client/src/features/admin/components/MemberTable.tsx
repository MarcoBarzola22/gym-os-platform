import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";

interface Member {
  id: string;
  name: string;
  dni: string;
  photo: string;
  status: "active" | "expired";
  expirationDate: string;
  streak: number;
}

interface MemberTableProps {
  members: Member[];
  onMemberClick: (member: Member) => void;
}

export function MemberTable({ members, onMemberClick }: MemberTableProps) {
  return (
    <div className="gym-card overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground">
                Socio
              </th>
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground">
                DNI
              </th>
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground">
                Estado
              </th>
              {/* --- NUEVA COLUMNA --- */}
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground">
                Vencimiento
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                onClick={() => onMemberClick(member)}
                className="border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors duration-200"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-border">
                      <AvatarImage src={member.photo} alt={member.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">
                      {member.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-muted-foreground font-medium">
                    {member.dni}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <Badge
                    variant={member.status === "active" ? "default" : "destructive"}
                    className={`font-semibold px-3 py-1 ${
                      member.status === "active"
                        ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                        : "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
                    }`}
                  >
                    {member.status === "active" ? "Al día" : "Vencido"}
                  </Badge>
                </td>
                {/* --- NUEVA CELDA CON EL CÁLCULO DE DÍAS --- */}
                <td className="py-4 px-6">
                  {member.expirationDate ? (
                    (() => {
                      const days = differenceInDays(new Date(member.expirationDate), new Date());
                      const isExpired = days < 0;
                      return (
                        <span className={`font-bold ${isExpired ? "text-destructive" : "text-success"}`}>
                          {isExpired ? `Venció hace ${Math.abs(days)} días` : `Quedan ${days} días`}
                        </span>
                      );
                    })()
                  ) : (
                    <span className="text-muted-foreground">Sin fecha</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}