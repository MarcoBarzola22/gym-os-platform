import { useState } from "react";
import { api } from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowRight, Lock, User } from "lucide-react";

// Definimos qué esperamos recibir del servidor
interface LoginResponse {
  name: string;
  role?: string; 
  // ... otros campos
}

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Petición al Backend
      const { data } = await api.post<LoginResponse>("/auth/login", { dni, password });
      
      // 2. Guardamos sesión (CRÍTICO)
      localStorage.setItem("gym_user", JSON.stringify(data));
      
      toast.success(`Bienvenido, ${data.name.split(" ")[0]}`);
      
      // 3. Depuración (Míralo en la consola con F12 si falla)
      console.log("LOGIN EXITOSO:", data);

      // 4. Redirección Robusta
      // Convertimos a mayúsculas por si el backend manda "admin" en minúscula
      const userRole = (data.role || "MEMBER").toUpperCase(); 

      if (userRole === "ADMIN") {
        console.log("Redirigiendo a ADMIN...");
        navigate("/admin");
      } else {
        console.log("Redirigiendo a APP...");
        navigate("/"); // <--- CAMBIADO: Antes tenías "/"
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Datos incorrectos", {
        description: "Revisa tu DNI o contraseña."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Fondo Ambiental */}
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Contenedor Principal */}
      <div className="w-full max-w-sm z-10 space-y-8">
        
        {/* Logo y Título */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 mb-6">
            <span className="text-white font-bold text-3xl">G</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido</h1>
          <p className="text-slate-400 text-sm">Ingresa a tu portal de socio</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="space-y-4 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="relative group">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              
              {/* --- AQUÍ ESTABA EL ERROR DEL NÚMERO --- */}
              <Input 
                placeholder="DNI / Usuario" 
                value={dni} 
                onChange={(e) => setDni(e.target.value)} 
                className="pl-12 bg-transparent border-transparent text-white placeholder:text-slate-600 h-12 focus-visible:ring-0 focus-visible:bg-white/5 rounded-xl transition-all"
                type="text" // <--- CAMBIADO A TEXT (Antes era number)
                autoFocus
              />
              {/* --------------------------------------- */}

            </div>
            
            <div className="h-[1px] bg-white/10 mx-2" />

            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                placeholder="Contraseña" 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 bg-transparent border-transparent text-white placeholder:text-slate-600 h-12 focus-visible:ring-0 focus-visible:bg-white/5 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 rounded-xl shadow-lg shadow-blue-900/20 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]" 
                type="submit" 
                disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                    Ingresar <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>

        </form>

        <p className="text-center text-slate-500 text-xs">
            ¿Olvidaste tu clave? Pídela en recepción.
        </p>

      </div>
      
      <p className="absolute bottom-6 text-slate-600 text-[10px] font-medium tracking-widest uppercase opacity-50">
        GymOS Platform © 2026
      </p>

    </div>
  );
}