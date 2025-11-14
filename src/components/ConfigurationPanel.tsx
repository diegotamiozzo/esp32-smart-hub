import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface IOConfig {
  enabled: boolean;
  label: string;
}

export interface DeviceConfig {
  relays: IOConfig[];
  digitalInputs: IOConfig[];
  analogInputs: IOConfig[];
}

interface ConfigurationPanelProps {
  config: DeviceConfig;
  onConfigChange: (config: DeviceConfig) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ConfigurationPanel = ({
  config,
  onConfigChange,
  onSave,
  onCancel,
}: ConfigurationPanelProps) => {
  const updateIO = (
    type: "relays" | "digitalInputs" | "analogInputs",
    index: number,
    field: "enabled" | "label",
    value: boolean | string
  ) => {
    const newConfig = { ...config };
    newConfig[type][index] = {
      ...newConfig[type][index],
      [field]: value,
    };
    onConfigChange(newConfig);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Configuração de Entradas e Saídas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Selecione quais I/Os você deseja monitorar e defina nomes personalizados
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Relay Outputs */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Saídas de Relé</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.relays.map((relay, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <Checkbox
                  id={`relay-${index}`}
                  checked={relay.enabled}
                  onCheckedChange={(checked) =>
                    updateIO("relays", index, "enabled", checked as boolean)
                  }
                />
                <Label
                  htmlFor={`relay-${index}`}
                  className="text-xs font-medium text-muted-foreground min-w-[50px]"
                >
                  OUT{index}
                </Label>
                <Input
                  placeholder={`Relé ${index}`}
                  value={relay.label}
                  onChange={(e) =>
                    updateIO("relays", index, "label", e.target.value)
                  }
                  disabled={!relay.enabled}
                  className="h-8"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Digital Inputs */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Entradas Digitais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.digitalInputs.map((input, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <Checkbox
                  id={`digital-${index}`}
                  checked={input.enabled}
                  onCheckedChange={(checked) =>
                    updateIO("digitalInputs", index, "enabled", checked as boolean)
                  }
                />
                <Label
                  htmlFor={`digital-${index}`}
                  className="text-xs font-medium text-muted-foreground min-w-[50px]"
                >
                  IN{index}
                </Label>
                <Input
                  placeholder={`Entrada ${index}`}
                  value={input.label}
                  onChange={(e) =>
                    updateIO("digitalInputs", index, "label", e.target.value)
                  }
                  disabled={!input.enabled}
                  className="h-8"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Analog Inputs */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Entradas Analógicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.analogInputs.map((input, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <Checkbox
                  id={`analog-${index}`}
                  checked={input.enabled}
                  onCheckedChange={(checked) =>
                    updateIO("analogInputs", index, "enabled", checked as boolean)
                  }
                />
                <Label
                  htmlFor={`analog-${index}`}
                  className="text-xs font-medium text-muted-foreground min-w-[50px]"
                >
                  AI{index}
                </Label>
                <Input
                  placeholder={`Analógica ${index}`}
                  value={input.label}
                  onChange={(e) =>
                    updateIO("analogInputs", index, "label", e.target.value)
                  }
                  disabled={!input.enabled}
                  className="h-8"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Salvar Configuração</Button>
        </div>
      </CardContent>
    </Card>
  );
};
