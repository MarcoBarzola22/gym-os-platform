import { CheckCircle2, XCircle } from "lucide-react";

interface ScannerOverlaySuccessProps {
  memberName: string;
  memberPhoto: string;
  daysRemaining: number;
}

interface ScannerOverlayErrorProps {
  reason: string;
}

export function ScannerOverlaySuccess({
  memberName,
  memberPhoto,
  daysRemaining,
}: ScannerOverlaySuccessProps) {
  return (
    <div className="absolute inset-0 scanner-overlay-success flex flex-col items-center justify-center p-8 animate-scale-in">
      <CheckCircle2 className="w-20 h-20 text-white/90 mb-6" />
      <img
        src={memberPhoto}
        alt={memberName}
        className="w-40 h-40 rounded-full object-cover border-4 border-white/30 shadow-2xl mb-6"
      />
      <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4">
        {memberName}
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white/90">
        ¡BIENVENIDO!
      </p>
      <p className="text-xl text-white/80 mt-2">
        Días restantes: {daysRemaining}
      </p>
    </div>
  );
}

export function ScannerOverlayError({ reason }: ScannerOverlayErrorProps) {
  return (
    <div className="absolute inset-0 scanner-overlay-error flex flex-col items-center justify-center p-8 animate-scale-in">
      <XCircle className="w-24 h-24 text-white/90 mb-6" />
      <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4">
        ACCESO DENEGADO
      </h2>
      <p className="text-xl md:text-2xl text-white/90 text-center">
        Motivo: {reason}
      </p>
    </div>
  );
}
