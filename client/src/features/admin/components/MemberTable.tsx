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
  rawExpiration: string;   // <--- Usamos esto para calcular exacto
  lastPaymentDate: string; // <--- Usamos esto para mostrar
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
              {/* --- COLUMNA DE FECHAS --- */}
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground">
                Último Pago
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              // LÓGICA DE ESTADO (Calculada al momento)
              // Usamos rawExpiration para que la matemática sea precisa
              const days = differenceInDays(new Date(member.rawExpiration), new Date());
              const isExpired = days < 0;

              return (
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
                  
                  {/* ESTADO CORREGIDO: Depende de los días, no del string "active" */}
                  <td className="py-4 px-6">
                    <Badge
                      variant={isExpired ? "destructive" : "default"}
                      className={`font-semibold px-3 py-1 ${
                        !isExpired
                          ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                          : "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
                      }`}
                    >
                      {isExpired ? "Vencido" : "Al día"}
                    </Badge>
                  </td>

                  {/* VENCIMIENTO CORREGIDO: Muestra último pago y días restantes */}
                  <td className="py-4 px-6">
                     <div className="flex flex-col">
                        {/* 1. Fecha de último pago (Texto negro/gris) */}
                        <span className="text-foreground font-bold">
                            {member.lastPaymentDate}
                        </span>
                        
                        {/* 2. Días restantes (Texto de color según estado) */}
                        <span className={`text-xs font-bold mt-1 ${isExpired ? "text-destructive" : "text-success"}`}>
                           {isExpired 
                             ? `Venció hace ${Math.abs(days)} días` 
                             : `Quedan ${days} días`
                           }
                        </span>
                     </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}