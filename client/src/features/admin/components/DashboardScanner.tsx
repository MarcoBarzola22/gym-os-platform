import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function DashboardScanner() {
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Referencia para evitar escaneos dobles muy rápidos
  const isProcessing = useRef(false);

  useEffect(() => {
    // Configuración del Escáner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 5, // Cuadros por segundo (5 está bien para no saturar)
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      if (isProcessing.current || decodedText === lastScan) return;
      
      isProcessing.current = true;
      setLastScan(decodedText); // Evitar re-escanear lo mismo inmediatamente
      
      handleValidation(decodedText);
      
      // Limpiar bloqueo después de 3 segundos
      setTimeout(() => {
        isProcessing.current = false;
        setLastScan(null);
      }, 3000);
    }

    function onScanFailure(error: any) {
      // Ignorar errores de "no QR found" para no ensuciar la consola
    }

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const handleValidation = async (qrContent: string) => {
    try {
        // Hacemos sonar un BIP (Opcional)
        const audio = new Audio('/beep.mp3'); // Si tienes un sonido
        audio.play().catch(() => {}); 

        const { data } = await api.post('/access/validate', { qrContent });
        
        setScanResult(data);
        setModalOpen(true); // Abrir modal con la foto del socio

    } catch (error: any) {
        console.error(error);
        const errorData = error.response?.data;
        
        setScanResult({
            authorized: false,
            reason: errorData?.reason || "Error de lectura",
            user: errorData?.user // A veces devuelve el usuario aunque esté vencido
        });
        setModalOpen(true);
    }
  };

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Escáner de Ingreso
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Aquí la librería inyecta el video */}
        <div id="reader" className="overflow-hidden rounded-xl border-2 border-slate-100 bg-slate-50"></div>
        
        <p className="text-xs text-center text-slate-400 mt-2">
            Apunta el QR del socio a la cámara
        </p>

        {/* --- MODAL DE RESULTADO (SEMAFORO) --- */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md text-center flex flex-col items-center p-10">
            
            {/* ICONO GIGANTE */}
            {scanResult?.authorized ? (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
            ) : (
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in">
                    <XCircle className="w-12 h-12 text-red-600" />
                </div>
            )}

            {/* FOTO Y DATOS */}
            {scanResult?.user && (
                <img 
                    src={scanResult.user.photoUrl} 
                    alt="Foto Socio" 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4 object-cover"
                />
            )}

            <h2 className={`text-3xl font-black uppercase ${scanResult?.authorized ? 'text-green-600' : 'text-red-600'}`}>
                {scanResult?.authorized ? "ACCESO PERMITIDO" : "ACCESO DENEGADO"}
            </h2>
            
            <p className="text-xl text-slate-700 font-bold mt-2">
                {scanResult?.user?.fullName || "Usuario Desconocido"}
            </p>

            {!scanResult?.authorized && (
                <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg mt-4 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {scanResult?.reason}
                </div>
            )}

            {/* BOTÓN PARA CERRAR RÁPIDO */}
            <Button 
                className="mt-8 w-full" 
                variant={scanResult?.authorized ? "default" : "destructive"}
                onClick={() => setModalOpen(false)}
            >
                Cerrar (Enter)
            </Button>

          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}