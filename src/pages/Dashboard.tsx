import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { RelayControl } from "@/components/RelayControl";
import { DigitalInputs } from "@/components/DigitalInputs";
import { AnalogInputs } from "@/components/AnalogInputs";
import { useMqttClient } from "@/hooks/useMqttClient";
import { useDeviceConfig } from "@/hooks/useDeviceConfig";
import { Settings, LogOut, Activity, User, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface DashboardProps {
  deviceMac: string;
  onSettings: () => void;
  onLogout: () => void;
}

const Dashboard = ({ deviceMac, onSettings, onLogout }: DashboardProps) => {
  const { connected, status, controlRelay } = useMqttClient({ deviceMac });
  const { config } = useDeviceConfig(deviceMac);

  // Cálculos de I/Os ativos
  const activeOutputs = status.relays_out.filter(r => r === 1).length;
  const activeInputs = status.digital_in.filter(d => d === 1).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header / Top Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-border">
          {/* Logo / Título */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard IoT</h1>
              <p className="text-sm text-muted-foreground">
                Monitoramento em Tempo Real
              </p>
            </div>
          </div>
          
          {/* Canto Superior Direito: Status + Ações de Usuário */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <ConnectionStatus 
              mqttConnected={connected} 
              deviceConnected={connected}
              deviceMac={deviceMac} 
            />
            
            <div className="h-8 w-px bg-border mx-1 hidden md:block"></div>

            <div className="flex items-center gap-2">
               {/* Nome / Identificação do Usuário (Simplificado) */}
<Button
  variant="outline"
  size="sm"
  onClick={onSettings}
  className="gap-2"
>
  <User className="h-4 w-4" />
  <span className="hidden sm:inline">Configurações</span>
</Button>


              <Button
                variant="destructive"
                size="sm"
                onClick={onLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Status MQTT */}
          <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Status MQTT</div>
            <div className={`text-2xl font-bold ${connected ? "text-green-500" : "text-red-500"}`}>
              {connected ? "Conectado" : "Desconectado"}
            </div>
          </div>

          {/* Card 2: Dispositivo (MAC Completo) */}
          <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Dispositivo (MAC)</div>
            <div className="text-xl md:text-2xl font-bold font-mono break-all">
              {deviceMac}
            </div>
          </div>

          {/* Card 3: Resumo de I/Os (Entradas e Saídas separadas) */}
          <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
            <div className="text-sm text-muted-foreground mb-2">I/Os Ativos</div>
            <div className="flex items-center justify-between gap-4">
              
              {/* Entradas */}
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="h-8 w-8 text-blue-500/80" />
                <div>
                  <span className="text-2xl font-bold">{activeInputs}</span>
                  <span className="text-xs text-muted-foreground block">Entradas</span>
                </div>
              </div>

              <div className="h-8 w-px bg-border"></div>

              {/* Saídas */}
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-8 w-8 text-orange-500/80" />
                <div>
                  <span className="text-2xl font-bold">{activeOutputs}</span>
                  <span className="text-xs text-muted-foreground block">Saídas</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Relay Controls */}
        <RelayControl
          relays={status.relays_out}
          config={config.relays}
          onToggle={controlRelay}
          disabled={!connected}
        />

        {/* Digital Inputs */}
        <DigitalInputs inputs={status.digital_in} config={config.digitalInputs} />

        {/* Analog Inputs */}
        <AnalogInputs inputs={status.analog_in} config={config.analogInputs} />
      </div>
    </div>
  );
};

export default Dashboard;