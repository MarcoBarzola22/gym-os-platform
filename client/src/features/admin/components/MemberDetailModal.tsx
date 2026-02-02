import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Asegúrate de tener este componente
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { CreditCard, Calendar, Trash2, History } from "lucide-react";
import { differenceInDays } from "date-fns";

interface MemberDetailModalProps {
  member: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailModal({ member, open, onOpenChange }: MemberDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // ESTADOS PARA EL FORMULARIO DE PAGO
  const [months, setMonths] = useState("1");
  const [amount, setAmount] = useState(15000);
  const [history, setHistory] = useState([]);

  // Actualizar monto automáticamente
  useEffect(() => {
    const m = parseFloat(months) || 0;
    setAmount(m * 15000); // $15.000 es el precio base
  }, [months]);

  // Cargar historial al abrir
  useEffect(() => {
    if (open && member) {
        api.get(`/payments/${member.id}`).then(res => setHistory(res.data)).catch(() => {});
    }
  }, [open, member]);

  if (!member) return null;

  // Lógica para mostrar días restantes
  const daysLeft = member.rawExpiration 
    ? differenceInDays(new Date(member.rawExpiration), new Date()) 
    : -1;

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // ENVIAMOS "months" AL BACKEND
      await api.post("/payments", {
        userId: member.id,
        amount: amount,
        months: parseFloat(months), // <--- IMPORTANTE
        method: "EFECTIVO"
      });

      toast.success(`Pago registrado`, {
        description: `Se sumaron ${(parseFloat(months)||0) * 30} días correctamente.`,
      });
      
      onOpenChange(false);
      window.location.reload(); 

    } catch (error) {
      console.error(error);
      toast.error("Error al registrar pago");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
      if(!confirm("¿Anular pago? Se restarán los días.")) return;
      try {
          await api.delete(`/payments/${id}`);
          toast.success("Pago anulado");
          onOpenChange(false);
          window.location.reload();
      } catch (e) { toast.error("Error"); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="relative">
            <img 
              src={member.photo} 
              alt={member.name} 
              className="w-24 h-24 rounded-full border-4 border-slate-100 shadow-lg object-cover"
            />
            <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-2 border-white ${daysLeft >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="text-center">
            <DialogTitle className="text-2xl font-bold">{member.name}</DialogTitle>
            <p className="text-slate-500 font-mono mt-1 text-sm">DNI: {member.dni}</p>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
            
            {/* 1. INFORMACIÓN DE VENCIMIENTO */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Estado Actual</p>
                        <p className={`text-sm font-bold ${daysLeft < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {daysLeft < 0 ? `Vencido hace ${Math.abs(daysLeft)} días` : `Quedan ${daysLeft} días`}
                        </p>
                    </div>
                </div>
                <Badge variant={daysLeft >= 0 ? "default" : "destructive"}>
                    {daysLeft >= 0 ? "Activo" : "Inactivo"}
                </Badge>
            </div>

            {/* 2. FORMULARIO DE PAGO */}
            <div className="bg-white p-4 rounded-xl border-2 border-slate-100 space-y-3">
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4"/> Nuevo Pago
                </p>
                <div className="flex gap-3">
                    <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Meses</label>
                        <Input 
                            type="number" 
                            min="1" 
                            value={months} 
                            onChange={(e) => setMonths(e.target.value)}
                            className="font-bold"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Monto Total</label>
                        <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                            onClick={handlePayment}
                            disabled={isLoading}
                        >
                            Cobrar ${amount.toLocaleString()}
                        </Button>
                    </div>
                </div>
            </div>

            {/* 3. HISTORIAL MINIATURA */}
            <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2 flex gap-1 items-center"><History className="w-3 h-3"/> Últimos movimientos</p>
                <div className="space-y-2">
                    {history.map((h:any) => (
                        <div key={h.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                            <span>${h.amount} ({h.months} meses)</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:bg-red-100" onClick={() => handleCancel(h.id)}>
                                <Trash2 className="w-3 h-3"/>
                            </Button>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-xs text-slate-300 italic">Sin pagos recientes</p>}
                </div>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}