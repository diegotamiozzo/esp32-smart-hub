import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { RelayControl } from "@/components/RelayControl";
import { DigitalInputs } from "@/components/DigitalInputs";
import { AnalogInputs } from "@/components/AnalogInputs";
import { useMqttClient } from "@/hooks/useMqttClient";
import { Activity } from "lucide-react";

const Index = () => {
  const [deviceMac, setDeviceMac] = useState("");
  const [configuredMac, setConfiguredMac] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  const { connected, status, controlRelay } = useMqttClient({
    deviceMac: configuredMac,
  });

  const handleConnect = () => {
    if (deviceMac.trim()) {
      setConfiguredMac(deviceMac.trim());
      setIsConfigured(true);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ESP32 PLC Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Industrial IoT Control Interface
              </p>
            </div>
          </div>
          {isConfigured && (
            <ConnectionStatus connected={connected} deviceMac={configuredMac} />
          )}
        </div>

        {/* Configuration Card */}
        {!isConfigured ? (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Connect to Device</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mac">Device MAC Address</Label>
                <Input
                  id="mac"
                  placeholder="XX:XX:XX:XX:XX:XX"
                  value={deviceMac}
                  onChange={(e) => setDeviceMac(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleConnect()}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the MAC address of your ESP32 PLC device
                </p>
              </div>
              <Button onClick={handleConnect} className="w-full">
                Connect
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Relay Controls */}
            <RelayControl
              relays={status.relays_out}
              onToggle={controlRelay}
              disabled={!connected}
            />

            {/* Digital Inputs */}
            <DigitalInputs inputs={status.digital_in} />

            {/* Analog Inputs */}
            <AnalogInputs inputs={status.analog_in} />

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
                Change Device
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
