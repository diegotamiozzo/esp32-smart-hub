import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { IOConfig } from "@/components/ConfigurationPanel";

interface RelayControlProps {
  relays: number[];
  config: IOConfig[];
  onToggle: (index: number, state: boolean) => void;
  disabled?: boolean;
}

export const RelayControl = ({ relays, config, onToggle, disabled }: RelayControlProps) => {
  const enabledRelays = relays
    .map((state, index) => ({ state, index, config: config[index] }))
    .filter((item) => item.config.enabled);

  if (enabledRelays.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Saídas de Relé</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {enabledRelays.map(({ state, index, config: ioConfig }) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <Label htmlFor={`relay-${index}`} className="text-sm font-medium text-center">
                {ioConfig.label}
              </Label>
              <span className="text-xs text-muted-foreground">OUT{index}</span>
              <Switch
                id={`relay-${index}`}
                checked={state === 1}
                onCheckedChange={(checked) => onToggle(index, checked)}
                disabled={disabled}
              />
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  state === 1 ? "bg-active shadow-lg shadow-active/50" : "bg-inactive"
                }`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
