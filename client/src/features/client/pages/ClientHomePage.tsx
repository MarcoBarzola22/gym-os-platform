import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code"; // Librería visual
import * as OTPAuth from "otpauth"; // Librería lógica
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, WifiOff } from "lucide-react";

export default function ClientHomePage() {
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState("");
  const [user, setUser] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // 1. Detectar si estamos offline (solo visual, el QR funciona igual)
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // 2. Cargar usuario del celular
    const storedUser = localStorage.getItem("gym_user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);

    // 3. Configurar el Generador TOTP (La Magia)
    // Usamos el 'qrSecret' que nos dio el backend al loguearnos
    // Si no hay secreto (usuarios viejos), usamos uno de respaldo
    const secret = userData.qrSecret || "JBSWY3DPEHPK3PXP"; 

    const totp = new OTPAuth.TOTP({
      issuer: "GymOS",
      label: userData.name,
      algorithm: "SHA1",
      digits: 6,
      period: 30, // El código cambia cada 30 segundos
      secret: secret 
    });

    // 4. Bucle que actualiza el QR cada segundo
    const updateQR = () => {
      // Generamos el token actual (ej: "123456")
      const token = totp.generate();
      
      // Calculamos cuánto falta para el próximo cambio
      const seconds = Math.floor(Date.now() / 1000);
      const remaining = 30 - (seconds % 30);
      setTimeLeft(remaining);

      // El QR contiene un JSON con ID + Token
      // Esto es lo que leerá la cámara de recepción
      setQrValue(JSON.stringify({ 
        id: userData.id, 
        token: token 
      }));
    };

    updateQR(); // Ejecutar ya
    const interval = setInterval(updateQR, 1000); // Y repetir

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("gym_user");
    navigate("/login");
  };

  if (!user) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-6 relative overflow-hidden">
      
      {/* Fondo decorativo */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hola, {user.name.split(" ")[0]}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
            <p className="text-sm text-slate-400">
              {user.status === 'active' ? 'Membresía Activa' : 'Membresía Vencida'}
            </p>
          </div>
        </div>
        <Button variant="secondary" size="icon" onClick={handleLogout} className="rounded-xl bg-slate-800 border-slate-700 hover:bg-slate-700 text-white">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Tarjeta del QR */}
      <Card className="bg-white/10 backdrop-blur-md border-slate-800 shadow-2xl rounded-[2rem] overflow-hidden mb-6 relative z-10">
        <CardContent className="flex flex-col items-center justify-center p-8 pt-12 pb-10">
          
          {/* El Código QR */}
          <div className="bg-white p-4 rounded-3xl shadow-xl mb-8">
             <QRCode 
                value={qrValue} 
                size={220} 
                level="H" // Alta corrección de errores (se lee aunque esté dañado)
                viewBox={`0 0 256 256`}
             />
          </div>

          <div className="text-center space-y-1">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
              Código de Acceso
            </p>
            <p className="text-white font-mono text-3xl font-bold tracking-widest">
              {/* Mostramos el número también por si la cámara falla */}
              {JSON.parse(qrValue || "{}").token?.match(/.{1,3}/g)?.join(" ") || "..."}
            </p>
          </div>
        </CardContent>

        {/* Barra de progreso animada */}
        <div className="h-1.5 bg-slate-800 w-full relative">
          <div 
            className="h-full bg-blue-500 absolute top-0 left-0 transition-all duration-1000 ease-linear shadow-[0_0_15px_#3b82f6]" 
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </Card>
      
      {/* Aviso Offline */}
      {isOffline && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center gap-3 justify-center mb-6">
          <WifiOff className="h-4 w-4 text-orange-400" />
          <p className="text-xs text-orange-200 font-medium">Modo sin conexión activado. Tu pase funciona igual.</p>
        </div>
      )}

      <p className="text-center text-slate-500 text-sm mt-auto pb-4">
        Acerca el código al escáner de recepción
      </p>
    </div>
  );
}