import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConnectionStatusProps {
  connected: boolean;
  deviceMac?: string;
}

export const ConnectionStatus = ({ connected, deviceMac }: ConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-3">
      <Badge 
        variant={connected ? "default" : "secondary"}
        className="flex items-center gap-2 px-3 py-1.5"
      >
        {connected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Disconnected</span>
          </>
        )}
      </Badge>
      {deviceMac && (
        <span className="text-sm text-muted-foreground">
          Device: {deviceMac}
        </span>
      )}
    </div>
  );
};
