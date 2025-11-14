import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RelayControlProps {
  relays: number[];
  onToggle: (index: number, state: boolean) => void;
  disabled?: boolean;
}

export const RelayControl = ({ relays, onToggle, disabled }: RelayControlProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Relay Outputs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relays.map((state, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <Label htmlFor={`relay-${index}`} className="text-sm font-medium">
                OUT{index}
              </Label>
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
