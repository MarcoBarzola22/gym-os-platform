import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import * as OTPAuth from "otpauth";
import { Button } from "@/components/ui/button";
import { LogOut, WifiOff, Sparkles, User, CreditCard } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ClientHomePage() {
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState("");
  const [user, setUser] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    const storedUser = localStorage.getItem("gym_user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Configuración del TOTP (Igual que antes)
    const secret = userData.qrSecret || "JBSWY3DPEHPK3PXP"; 
    const totp = new OTPAuth.TOTP({
      issuer: "GymOS",
      label: userData.name,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret 
    });

    const updateQR = () => {
      const token = totp.generate();
      const seconds = Math.floor(Date.now() / 1000);
      const remaining = 30 - (seconds % 30);
      setTimeLeft(remaining);

      setQrValue(JSON.stringify({ 
        id: userData.id, 
        token: token 
      }));
    };

    updateQR();
    const interval = setInterval(updateQR, 1000);

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

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500">Cargando pase...</div>;

  const isActive = user.status === 'active';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden font-sans">
      
      {/* --- FONDO AMBIENTAL --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* --- HEADER --- */}
      <div className="p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <span className="font-bold text-lg">G</span>
            </div>
            <div>
                <h1 className="font-bold text-lg tracking-tight leading-none">GymOS</h1>
                <p className="text-xs text-slate-400 font-medium">Digital Pass</p>
            </div>
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
        
        {/* LA TARJETA DEL PASE */}
        <div className="w-full max-w-sm relative group perspective">
            
            {/* Brillo de borde animado */}
            <div className={`absolute -inset-0.5 rounded-[2rem] opacity-75 blur transition duration-1000 ${isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-400' : 'bg-gradient-to-r from-red-600 to-orange-400'}`}></div>
            
            <div className="relative bg-slate-900 rounded-[1.9rem] p-6 shadow-2xl border border-slate-800 flex flex-col items-center overflow-hidden">
                
                {/* Encabezado de la Tarjeta */}
                <div className="w-full flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-slate-800 shadow-sm">
                            <AvatarImage src={user.photoUrl} />
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-lg leading-tight">{user.name}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                {isActive ? (
                                    <span className="text-green-400 flex items-center gap-1">● Membresía Activa</span>
                                ) : (
                                    <span className="text-red-400 flex items-center gap-1">● Membresía Vencida</span>
                                )}
                            </p>
                        </div>
                    </div>
                    {isOffline && <WifiOff className="text-orange-400 animate-pulse" size={20} />}
                </div>

                {/* Área del QR (Blanca para contraste) */}
                <div className="bg-white p-4 rounded-3xl shadow-inner mb-6 relative w-full aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 border-[3px] border-dashed border-slate-200 rounded-3xl pointer-events-none"></div>
                     <QRCode 
                        value={qrValue} 
                        size={200} 
                        level="H" 
                        viewBox={`0 0 256 256`}
                        className="w-full h-full object-contain"
                     />
                    
                    {/* Logo central sobre el QR (Opcional, estilo moderno) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl"></div>
                    </div>
                </div>

                {/* Código Numérico y Timer */}
                <div className="w-full bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Código de Acceso</p>
                        <p className="font-mono text-2xl font-bold tracking-widest text-slate-200">
                             {JSON.parse(qrValue || "{}").token?.match(/.{1,3}/g)?.join(" ") || "..."}
                        </p>
                    </div>
                    
                    {/* Reloj Circular */}
                    <div className="relative flex items-center justify-center w-10 h-10">
                        <svg className="absolute w-full h-full rotate-[-90deg]">
                            <circle cx="20" cy="20" r="16" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                            <circle 
                                cx="20" cy="20" r="16" 
                                fill="transparent" 
                                stroke={isActive ? "#3b82f6" : "#ef4444"} 
                                strokeWidth="4" 
                                strokeDasharray="100" 
                                strokeDashoffset={100 - (timeLeft / 30) * 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <span className="text-[10px] font-bold text-slate-400">{timeLeft}</span>
                    </div>
                </div>

            </div>
        </div>

        {/* --- FOOTER INFORMATIVO --- */}
        <div className="mt-8 text-center space-y-2 opacity-60">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <Sparkles size={14} className="text-yellow-400" />
                <span>Acerca el código al escáner</span>
            </div>
            {!isActive && (
                <p className="text-xs text-red-400 bg-red-900/20 px-3 py-1 rounded-full border border-red-900/30">
                    Tu cuota venció. Pasa por recepción.
                </p>
            )}
        </div>

      </div>
    </div>
  );
}