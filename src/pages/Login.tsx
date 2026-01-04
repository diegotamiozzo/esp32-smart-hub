import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LoginProps {
  onConnect: (mac: string) => void;
}

const Login = ({ onConnect }: LoginProps) => {
  const [deviceMac, setDeviceMac] = useState("");

  const handleConnect = () => {
    const mac = deviceMac.trim().toUpperCase().replace(/:/g, "");

    if (!mac) {
      toast.error("Digite um MAC address válido!");
      return;
    }

    if (mac.length !== 12) {
      toast.error("MAC address deve ter 12 caracteres!");
      return;
    }

    onConnect(mac);
  };

  return (
    // Fundo da Página: Slate-950 (Bem escuro/industrial)
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden bg-slate-950">

      {/* Efeito de Overlay para focar no centro */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 to-slate-950/80" />

      {/* Card Principal */}
      <Card className="max-w-md w-full relative z-10 bg-slate-50 shadow-2xl border-slate-200">
        <CardHeader className="text-center space-y-4 pb-2">
          
          {/* LOGO */}
          <div className="flex justify-center py-2">
            <img
              src="/logo.png"
              alt="Logo do Sistema"
              className="h-40 w-auto object-contain drop-shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              ESP32 PLC Dashboard
            </CardTitle>
            <p className="text-sm text-slate-600">
              Configure o dispositivo para iniciar
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="mac" className="text-slate-700 font-medium">
              Endereço MAC do Dispositivo
            </Label>
            
            {/* Input com fundo Branco para destacar do Card Cinza Claro */}
            <Input
              id="mac"
              placeholder="AABBCCDDEEFF"
              value={deviceMac}
              onChange={(e) => setDeviceMac(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              maxLength={12}
              className="bg-white border-slate-300 text-slate-900 font-mono text-center text-lg tracking-widest uppercase h-12 focus-visible:ring-slate-900 placeholder:text-slate-400 shadow-sm"
            />
            
            <p className="text-xs text-slate-500 text-center">
              12 caracteres hexadecimais
            </p>
          </div>

          <Button
            onClick={handleConnect}
            className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all active:scale-[0.98]"
            size="lg"
          >
            Conectar ao Dispositivo
          </Button>
        </CardContent>
      </Card>

      {/* Rodapé discreto */}
      <div className="absolute bottom-6 w-full text-center text-xs text-white shadow-md">
        © {new Date().getFullYear()} Sistema de Automação Industrial
      </div>
    </div>
  );
};

export default Login;