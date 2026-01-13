import { Navigation } from "@/components/gym/Navigation";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, RefreshCw } from "lucide-react";
import qrPlaceholder from "@/assets/qr-placeholder.png";

export default function ClientApp() {
  const memberName = "Carlos";
  const expirationDate = "15/Oct/2025";
  const daysUsed = 10;
  const totalDays = 30;
  const progressPercent = (daysUsed / totalDays) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* Greeting */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hola, {memberName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Tu acceso está listo para usar
          </p>
        </div>

        {/* QR Card */}
        <div className="gym-card p-6 text-center mb-6 animate-fade-in">
          <div className="bg-white rounded-2xl p-4 inline-block mb-4 shadow-lg">
            <img
              src={qrPlaceholder}
              alt="Código QR de acceso"
              className="w-48 h-48 mx-auto"
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
            Actualizando código automáticamente...
          </div>
        </div>

        {/* Status Card */}
        <div className="gym-card p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="font-bold text-lg">Estado: ACTIVO</p>
              <p className="text-muted-foreground text-sm">
                Tu plan vence el {expirationDate}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso del mes</span>
              <span className="font-semibold">
                {daysUsed} de {totalDays} días
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <div className="gym-card p-4 text-center">
            <p className="text-3xl font-extrabold text-primary">20</p>
            <p className="text-sm text-muted-foreground">Días restantes</p>
          </div>
          <div className="gym-card p-4 text-center">
            <p className="text-3xl font-extrabold text-warning">🔥 5</p>
            <p className="text-sm text-muted-foreground">Meses de racha</p>
          </div>
        </div>
      </main>
    </div>
  );
}
