import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    if (deviceMac.trim()) {
      const mac = deviceMac.trim().toUpperCase().replace(/:/g, '');
      if (mac.length === 12) {
        onConnect(mac);
      } else {
        toast.error("MAC address deve ter 12 caracteres!");
      }
    } else {
      toast.error("Digite um MAC address válido!");
    }
  };

  return (
    // CONTAINER PRINCIPAL: relative para conter os elementos absolutos
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
      
      {/* 1. CAMADA DA IMAGEM DE FUNDO */}
      <div 
        className="absolute inset-0 z-0"
        style={{
            // Troque '/bg-industria.jpg' pelo caminho da sua imagem de fundo
            backgroundImage: 'url("/bg-industria.jpg")', 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
      />

      {/* 2. OVERLAY (MÁSCARA ESCURA) */}
      {/* Isso garante que o texto fique legível independente da imagem de fundo */}
      <div className="absolute inset-0 z-0 bg-black/60" />

      {/* CARD DE LOGIN */}
      {/* z-10 para ficar acima do fundo, backdrop-blur para efeito de vidro */}
      <Card className="max-w-md w-full relative z-10 bg-card/95 backdrop-blur-sm shadow-2xl border-white/10">
        <CardHeader className="space-y-4 text-center">
          
          {/* Logo Container */}
          <div className="mx-auto w-32 h-32 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner border border-primary/20">
            <img
              src="/logo.png"
              alt="Logo da Empresa"
              className="w-32 h-32 object-contain drop-shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              ESP32 PLC Dashboard
            </CardTitle>
            <CardDescription className="text-sm">
              Configure o dispositivo para começar o monitoramento
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mac">Endereço MAC do Dispositivo</Label>
            <Input
              id="mac"
              placeholder="AABBCCDDEEFF"
              value={deviceMac}
              onChange={(e) => setDeviceMac(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleConnect()}
              className="font-mono text-center text-lg tracking-wider uppercase h-12 border-primary/20 focus-visible:ring-primary/30"
              maxLength={12}
            />
            <p className="text-xs text-muted-foreground text-center">
              Digite o MAC address do ESP32 (12 caracteres hexadecimais)
            </p>
          </div>
          
          <Button 
            onClick={handleConnect} 
            className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-primary/25 transition-all" 
            size="lg"
          >
            Conectar ao Dispositivo
          </Button>
        </CardContent>
      </Card>
      
      {/* Rodapé Opcional (Fica bonito em telas de login fullscreen) */}
      <div className="absolute bottom-4 text-center w-full z-10 text-white/40 text-xs">
        &copy; {new Date().getFullYear()} Sistema de Automação Industrial
      </div>
    </div>
  );
};

export default Login;