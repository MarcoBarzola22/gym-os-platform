import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, DoorOpen, Flame } from "lucide-react";

interface Member {
  id: string;
  name: string;
  dni: string;
  photo: string;
  status: "active" | "expired";
  expirationDate: string;
  streak: number;
}

interface MemberDetailModalProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailModal({ member, open, onOpenChange }: MemberDetailModalProps) {
  if (!member) return null;

  const isActive = member.status === "active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Photo */}
          <div className="md:w-1/2 bg-muted">
            <img
              src={member.photo}
              alt={member.name}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>

          {/* Right side - Details */}
          <div className="md:w-1/2 p-6 flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-3xl font-extrabold tracking-tight">
                {member.name}
              </DialogTitle>
              <p className="text-lg text-muted-foreground font-medium">
                DNI: {member.dni}
              </p>
            </DialogHeader>

            {/* Status indicator */}
            <div
              className={`inline-flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-lg mb-4 w-fit ${
                isActive ? "status-active" : "status-expired"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full ${
                  isActive ? "bg-success" : "bg-destructive"
                } animate-pulse`}
              />
              {isActive ? "AL DÍA" : "VENCIDO"}
            </div>

            {/* Expiration date */}
            <p className="text-muted-foreground mb-2">
              <span className="font-semibold text-foreground">Vence el:</span>{" "}
              {member.expirationDate}
            </p>

            {/* Streak */}
            <div className="flex items-center gap-2 mb-6 text-lg">
              <Flame className="w-6 h-6 text-warning" />
              <span className="font-bold">{member.streak} meses seguidos</span>
            </div>

            {/* Action buttons */}
            <div className="mt-auto space-y-3">
              <Button variant="gymLarge" className="w-full" size="xl">
                <CreditCard className="w-5 h-5 mr-2" />
                REGISTRAR PAGO (30 DÍAS)
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <DoorOpen className="w-5 h-5 mr-2" />
                INGRESO MANUAL (SIN QR)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
