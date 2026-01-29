import { useState } from "react";
import { api } from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Preguntamos al backend si las credenciales son válidas
      const { data } = await api.post("/auth/login", { dni, password });
      
      // 2. ¡ÉXITO! Guardamos al usuario y su SECRETO en el celular
      localStorage.setItem("gym_user", JSON.stringify(data));
      
      toast.success(`Hola de nuevo, ${data.name.split(" ")[0]}`);
      
      // 3. Lo mandamos directo a ver su QR
      navigate("/"); 
      
    } catch (error) {
      console.error(error);
      toast.error("DNI o Contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-sm shadow-2xl border-slate-800 bg-slate-950 text-white">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="text-white font-black text-3xl tracking-tighter">G</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Bienvenido Socio</CardTitle>
            <CardDescription className="text-slate-400">Ingresa para ver tu pase de acceso</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Tu DNI" 
                  value={dni} 
                  onChange={(e) => setDni(e.target.value)} 
                  className="pl-10 bg-slate-900 border-slate-800 focus:border-blue-600 text-white"
                  type="number"
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Contraseña (Tu DNI)" 
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-800 focus:border-blue-600 text-white"
                />
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-11" type="submit" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Ver mi Pase QR"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}