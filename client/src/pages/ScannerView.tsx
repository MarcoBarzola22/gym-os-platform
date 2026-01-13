import { useState } from "react";
import {
  ScannerOverlaySuccess,
  ScannerOverlayError,
} from "@/components/gym/ScannerOverlay";
import { Button } from "@/components/ui/button";
import { ScanLine, RefreshCw, Dumbbell } from "lucide-react";
import member1 from "@/assets/member-1.jpg";

type ScanState = "idle" | "success" | "error";

export default function ScannerView() {
  const [scanState, setScanState] = useState<ScanState>("idle");

  const simulateSuccess = () => {
    setScanState("success");
  };

  const simulateError = () => {
    setScanState("error");
  };

  const resetScanner = () => {
    setScanState("idle");
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,6%)]">
      {/* Custom dark nav for scanner */}
      <nav className="bg-[hsl(222,47%,8%)] border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                GymFlow
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">
            Punto de Acceso
          </h1>
          <p className="text-white/60 text-lg">
            Escanea tu código QR para ingresar
          </p>
        </div>

        {/* Scanner area */}
        <div className="max-w-lg mx-auto">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-[hsl(222,47%,10%)] border-2 border-white/10">
            {/* Camera simulation */}
            <div className="absolute inset-0 flex items-center justify-center">
              {scanState === "idle" && (
                <>
                  {/* Scan frame corners */}
                  <div className="absolute inset-8">
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                  </div>

                  {/* Scan line animation */}
                  <div className="absolute inset-x-12 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />

                  {/* Center icon */}
                  <div className="flex flex-col items-center gap-4">
                    <ScanLine className="w-20 h-20 text-primary/40 animate-pulse-slow" />
                    <p className="text-white/40 font-medium">
                      Esperando código QR...
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Success overlay */}
            {scanState === "success" && (
              <ScannerOverlaySuccess
                memberName="Carlos Martínez"
                memberPhoto={member1}
                daysRemaining={20}
              />
            )}

            {/* Error overlay */}
            {scanState === "error" && (
              <ScannerOverlayError reason="Cuota Vencida" />
            )}
          </div>

          {/* Simulation buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={simulateSuccess}
              variant="success"
              size="lg"
              className="flex-1"
            >
              Simular Éxito
            </Button>
            <Button
              onClick={simulateError}
              variant="destructive"
              size="lg"
              className="flex-1"
            >
              Simular Error
            </Button>
            {scanState !== "idle" && (
              <Button
                onClick={resetScanner}
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
