import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { CreditCard, Calendar, User, CheckCircle2 } from "lucide-react";
import { differenceInDays } from "date-fns";

interface MemberDetailModalProps {
  member: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailModal({ member, open, onOpenChange }: MemberDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!member) return null;

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      // Cobramos $15.000 (Hardcodeado por ahora, luego puede ser input)
      await api.post("/payments", {
        userId: member.id,
        amount: 15000, 
        method: "EFECTIVO"
      });

      toast.success(`¡Pago registrado!`, {
        description: `${member.name} renovado por 30 días.`,
      });
      
      onOpenChange(false); // Cerramos modal
      window.location.reload(); // Recarga brutal para actualizar tabla (luego lo mejoramos)
      
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar pago");
    } finally {
      setIsLoading(false);
    }
  };
  const daysLeft = differenceInDays(new Date(member.rawExpiration), new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="relative">
            <img 
              src={member.photo} 
              alt={member.name} 
              className="w-24 h-24 rounded-full border-4 border-slate-100 shadow-lg object-cover"
            />
            <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-2 border-white ${member.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="text-center">
            <DialogTitle className="text-2xl font-bold">{member.name}</DialogTitle>
            <p className="text-slate-500 font-mono mt-1">DNI: {member.dni}</p>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase">Vencimiento</p>
                <p className="text-sm font-bold text-slate-700">{member.expirationDate}</p>
                <p className={`text-xs font-bold ${daysLeft < 0 ? 'text-red-500' : 'text-blue-600'}`}>
                   {daysLeft < 0 ? `Venció hace ${Math.abs(daysLeft)} días` : `Quedan ${daysLeft} días`}
                </p>
              </div>
            </div>
            {member.status === 'active' ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Al día</Badge>
            ) : (
                <Badge variant="destructive">Vencido</Badge>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-md shadow-md shadow-green-600/20"
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" /> Registrar Pago ($15.000)
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}