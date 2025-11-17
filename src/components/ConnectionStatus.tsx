import { Wifi, WifiOff, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConnectionStatusProps {
  mqttConnected: boolean;
  deviceConnected: boolean;
  deviceMac?: string;
}

export const ConnectionStatus = ({ mqttConnected, deviceConnected, deviceMac }: ConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-3">
      <Badge 
        variant="secondary"
        className={`flex items-center gap-2 px-3 py-1.5 ${
          mqttConnected ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : ''
        }`}
      >
        {mqttConnected ? (
          <>
            <Radio className="h-4 w-4" />
            <span>MQTT Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>MQTT Desconectado</span>
          </>
        )}
      </Badge>
      
      <Badge 
        variant="secondary"
        className={`flex items-center gap-2 px-3 py-1.5 ${
          deviceConnected ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : ''
        }`}
      >
        {deviceConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Dispositivo Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Dispositivo Desconectado</span>
          </>
        )}
      </Badge>
      
      {deviceMac && (
        <span className="text-sm text-muted-foreground">
          MAC: {deviceMac}
        </span>
      )}
    </div>
  );
};
