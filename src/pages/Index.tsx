import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { RelayControl } from "@/components/RelayControl";
import { DigitalInputs } from "@/components/DigitalInputs";
import { AnalogInputs } from "@/components/AnalogInputs";
import { ConfigurationPanel } from "@/components/ConfigurationPanel";
import { useMqttClient } from "@/hooks/useMqttClient";
import { useDeviceConfig } from "@/hooks/useDeviceConfig";
import { Activity, Settings } from "lucide-react";
import { toast } from "sonner";
import plcLogo from "@/assets/plc-logo.png";

const Index = () => {
  const [deviceMac, setDeviceMac] = useState("");
  const [configuredMac, setConfiguredMac] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const { connected, status, controlRelay } = useMqttClient({
    deviceMac: configuredMac,
  });

  const { config, saveConfig } = useDeviceConfig(configuredMac);
  const [tempConfig, setTempConfig] = useState(config);

  const handleConnect = () => {
    if (deviceMac.trim()) {
      setConfiguredMac(deviceMac.trim());
      setIsConfigured(true);
    }
  };

  const handleOpenConfig = () => {
    setTempConfig(config);
    setShowConfig(true);
  };

  const handleSaveConfig = () => {
    saveConfig(tempConfig);
    setShowConfig(false);
    toast.success("Configuração salva com sucesso!");
  };

  const handleCancelConfig = () => {
    setTempConfig(config);
    setShowConfig(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <img src={plcLogo} alt="ESP32 PLC Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-3xl font-bold">ESP32 PLC Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Interface de Controle IoT Industrial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isConfigured && !showConfig && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenConfig}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configurar I/O
                </Button>
                <ConnectionStatus 
                  mqttConnected={connected} 
                  deviceConnected={isConfigured && connected}
                  deviceMac={configuredMac} 
                />
              </>
            )}
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig ? (
          <ConfigurationPanel
            config={tempConfig}
            onConfigChange={setTempConfig}
            onSave={handleSaveConfig}
            onCancel={handleCancelConfig}
          />
        ) : !isConfigured ? (
          /* Connection Card */
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Conectar ao Dispositivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mac">Endereço MAC do Dispositivo</Label>
                <Input
                  id="mac"
                  placeholder="XX:XX:XX:XX:XX:XX"
                  value={deviceMac}
                  onChange={(e) => setDeviceMac(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleConnect()}
                />
                <p className="text-xs text-muted-foreground">
                  Digite o endereço MAC do seu dispositivo ESP32 PLC
                </p>
              </div>
              <Button onClick={handleConnect} className="w-full">
                Conectar
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Dashboard */
          <>
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

            {/* Reconfigure Button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfigured(false);
                  setDeviceMac("");
                  setConfiguredMac("");
                }}
              >
                Trocar Dispositivo
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
