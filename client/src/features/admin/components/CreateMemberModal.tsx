import { useState } from "react";
import { api } from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateMemberModal({ open, onOpenChange, onSuccess }: CreateMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    email: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.dni) {
      toast.error("Nombre y DNI son obligatorios");
      return;
    }

    try {
      setIsLoading(true);
      // Enviamos al backend
      await api.post("/users", formData);
      
      toast.success(`¡Socio registrado! Clave: ${formData.dni}`);
      
      // Limpiar formulario
      setFormData({ fullName: "", dni: "", email: "" });
      onOpenChange(false);
      onSuccess(); // Recargar tabla

    } catch (error) {
      console.error(error);
      toast.error("Error al registrar. Verificá si el DNI ya existe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Socio</DialogTitle>
          <DialogDescription>
            Se le asignarán 30 días de acceso. Su contraseña será su DNI.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              placeholder="Ej: Marco Barzola"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dni">DNI (Será su usuario y clave)</Label>
            <Input
              id="dni"
              placeholder="Ej: 12345678"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}