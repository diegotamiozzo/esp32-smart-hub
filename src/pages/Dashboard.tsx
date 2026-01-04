import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { RelayControl } from "@/components/RelayControl";
import { DigitalInputs } from "@/components/DigitalInputs";
import { AnalogInputs } from "@/components/AnalogInputs";
import { useMqttClient } from "@/hooks/useMqttClient";
import { useDeviceConfig } from "@/hooks/useDeviceConfig";
import { Settings, LogOut, Activity } from "lucide-react";

interface DashboardProps {
  deviceMac: string;
  onSettings: () => void;
  onLogout: () => void;
}

const Dashboard = ({ deviceMac, onSettings, onLogout }: DashboardProps) => {
  const { connected, status, controlRelay } = useMqttClient({ deviceMac });
  const { config } = useDeviceConfig(deviceMac);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
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
          
          <div className="flex items-center gap-3 flex-wrap">
            <ConnectionStatus 
              mqttConnected={connected} 
              deviceConnected={connected}
              deviceMac={deviceMac} 
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onSettings}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-sm text-muted-foreground mb-1">Status MQTT</div>
            <div className="text-2xl font-bold">
              {connected ? "Conectado" : "Desconectado"}
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-sm text-muted-foreground mb-1">Dispositivo</div>
            <div className="text-2xl font-bold font-mono">
              {deviceMac.slice(0, 6)}...
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-sm text-muted-foreground mb-1">I/Os Ativos</div>
            <div className="text-2xl font-bold">
              {status.relays_out.filter(r => r === 1).length}/
              {status.relays_out.length}
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