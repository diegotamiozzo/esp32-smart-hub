import { useEffect, useState } from "react";
import mqtt from "mqtt";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Wifi, XCircle, History, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"; // Certifique-se de ter este componente ou use uma div simples

interface LoginProps {
  onConnect: (mac: string) => void;
}

const Login = ({ onConnect }: LoginProps) => {
  const [deviceMac, setDeviceMac] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Estado para armazenar os últimos dispositivos
  const [recentDevices, setRecentDevices] = useState<string[]>([]);

  // Carrega histórico do LocalStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem("plc_recent_devices");
    if (saved) {
      try {
        setRecentDevices(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao ler histórico", e);
      }
    }
  }, []);

  // Validação em tempo real do MAC
  useEffect(() => {
    if (!deviceMac) {
      setIsValid(null);
      return;
    }
    setIsValid(/^[0-9A-F]{12}$/.test(deviceMac));
  }, [deviceMac]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/[^0-9A-Fa-f]/g, "")
      .toUpperCase()
      .slice(0, 12);

    setDeviceMac(value);
  };

  // Função para salvar no histórico
  const addToHistory = (mac: string) => {
    // Remove o mac se já existir (para mover para o topo) e limita a 3 itens
    const newHistory = [mac, ...recentDevices.filter((d) => d !== mac)].slice(0, 3);
    setRecentDevices(newHistory);
    localStorage.setItem("plc_recent_devices", JSON.stringify(newHistory));
  };

  // Função para remover um item específico do histórico
  const removeFromHistory = (e: React.MouseEvent, macToDelete: string) => {
    e.stopPropagation(); // Evita que o clique no X preencha o input
    const newHistory = recentDevices.filter((d) => d !== macToDelete);
    setRecentDevices(newHistory);
    localStorage.setItem("plc_recent_devices", JSON.stringify(newHistory));
  };

  const testMqttConnection = async (
    mac: string
  ): Promise<{ success: boolean; deviceOnline: boolean }> => {
    return new Promise((resolve) => {
      // Nota: Em produção, cuidado com credenciais expostas no frontend
      const client = mqtt.connect(import.meta.env.VITE_MQTT_BROKER_URL, {
        clientId: `test-${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        connectTimeout: 5000,
        username: import.meta.env.VITE_MQTT_USERNAME,
        password: import.meta.env.VITE_MQTT_PASSWORD,
      });

      let deviceFound = false;

      const timeout = setTimeout(() => {
        client.end(true);
        resolve({ success: true, deviceOnline: deviceFound });
      }, 5000); // Reduzi para 5s para ser mais ágil, ajuste conforme a latência da rede

      client.on("connect", () => {
        client.subscribe(`plc/${mac}/status`);
      });

      client.on("message", (topic, payload) => {
        if (topic !== `plc/${mac}/status`) return;

        try {
          const data = JSON.parse(payload.toString());
          // Validação básica da estrutura
          if (data.digital_in || data.uptime) { // Simplifiquei a validação para teste
             deviceFound = true;
             clearTimeout(timeout);
             client.end(true);
             resolve({ success: true, deviceOnline: true });
          }
        } catch {
          // Ignora payload inválido
        }
      });

      client.on("error", () => {
        clearTimeout(timeout);
        client.end(true);
        resolve({ success: false, deviceOnline: false });
      });
    });
  };

  const handleConnect = async () => {
    if (!isValid) return;

    setTestingConnection(true);
    toast.loading("Conectando ao broker MQTT...", { id: "mqtt-test" });

    const { success, deviceOnline } = await testMqttConnection(deviceMac);

    if (!success) {
      toast.error("Erro ao conectar ao broker MQTT", { id: "mqtt-test" });
      setTestingConnection(false);
      return;
    }

    if (!deviceOnline) {
      toast.error(
        `Dispositivo ${deviceMac} offline ou sem resposta.`,
        { id: "mqtt-test" }
      );
      setTestingConnection(false);
      return;
    }

    toast.success("Dispositivo validado!", {
      id: "mqtt-test",
    });

    // Salva no histórico antes de conectar
    addToHistory(deviceMac);

    setTimeout(() => onConnect(deviceMac), 500);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 to-slate-950/80" />

      <Card className="max-w-md w-full relative z-10 bg-slate-50 shadow-2xl border-slate-200">
        <CardHeader className="text-center space-y-4 pb-2">

          {/* LOGO */}
          <div className="flex justify-center py-2">
            <img
              src="/logo.png"
              alt="Logo do Sistema"
              className="h-28 w-auto object-contain drop-shadow-sm"
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
            <Label className="text-slate-700 font-medium">
              Endereço MAC do Dispositivo
            </Label>

            <div className="relative">
              <Input
                placeholder="AABBCCDDEEFF"
                value={deviceMac}
                onChange={handleInputChange}
                maxLength={12}
                disabled={testingConnection}
                className={`bg-white border-2 text-slate-900 font-mono text-center text-lg tracking-widest uppercase h-12 focus-visible:ring-slate-900 placeholder:text-slate-400 shadow-sm pr-10 transition-all ${
                  isValid === null
                    ? "border-slate-300"
                    : isValid
                    ? "border-green-500 focus-visible:ring-green-500"
                    : "border-red-500 focus-visible:ring-red-500"
                }`}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && isValid && !testingConnection) handleConnect();
                }}
              />

              {deviceMac && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleConnect}
            disabled={!isValid || testingConnection}
            className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all active:scale-[0.98]"
          >
            {testingConnection ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Validando...
              </>
            ) : (
              <>
                <Wifi className="h-5 w-5 mr-2" />
                Conectar
              </>
            )}
          </Button>

          {/* Seção de Histórico */}
          {recentDevices.length > 0 && (
            <div className="pt-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                  <History className="w-3 h-3" /> Recentes
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="grid gap-2 mt-1">
                {recentDevices.map((mac) => (
                  <div
                    key={mac}
                    onClick={() => setDeviceMac(mac)}
                    className="group flex items-center justify-between p-3 rounded-md border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {mac.slice(-2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium text-slate-700 tracking-wide">
                          {mac}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Última conexão salva
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => removeFromHistory(e, mac)}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover do histórico"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="absolute bottom-6 w-full text-center text-xs text-white shadow-md opacity-80">
        © {new Date().getFullYear()} Sistema de Automação Industrial
      </div>
    </div>
  );
};

export default Login;