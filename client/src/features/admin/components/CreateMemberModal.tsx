import { useState } from "react";
import { api } from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

interface CreateMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void; // Función para avisar al padre que recargue la tabla
}

export function CreateMemberModal({ open, onOpenChange, onSuccess }: CreateMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    email: "" // Opcional
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación simple
    if (!formData.fullName || !formData.dni) {
      toast.error("Por favor completa Nombre y DNI");
      return;
    }

    try {
      setIsLoading(true);
      
      // Enviamos los datos al Backend
      // El backend se encarga de crear la contraseña (DNI) y el qrSecret
      await api.post("/users", formData);

      toast.success(`¡Socio ${formData.fullName} registrado!`, {
        description: "Su contraseña inicial es su DNI.",
      });
      
      // Limpiamos el formulario
      setFormData({ fullName: "", dni: "", email: "" });
      
      // Cerramos el modal
      onOpenChange(false);
      
      // Avisamos al Dashboard que actualice la lista
      onSuccess();

    } catch (error) {
      console.error(error);
      toast.error("Error al registrar. ¿El DNI ya existe?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle>Registrar Nuevo Socio</DialogTitle>
          </div>
          <DialogDescription>
            Ingresa los datos del cliente. Se le darán 30 días de acceso automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Campo Nombre */}
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              placeholder="Ej: Juan Pérez"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              autoFocus
            />
          </div>

          {/* Campo DNI */}
          <div className="grid gap-2">
            <Label htmlFor="dni">DNI / Documento</Label>
            <Input
              id="dni"
              type="number"
              placeholder="Sin puntos (Ej: 35111222)"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            />
            <p className="text-[0.8rem] text-slate-500">
              * Este será su usuario y contraseña para entrar a la App.
            </p>
          </div>

          {/* Campo Email (Opcional) */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email (Opcional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Registrar Socio"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}