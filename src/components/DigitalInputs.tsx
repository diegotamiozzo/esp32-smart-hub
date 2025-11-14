import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IOConfig } from "@/components/ConfigurationPanel";

interface DigitalInputsProps {
  inputs: number[];
  config: IOConfig[];
}

export const DigitalInputs = ({ inputs, config }: DigitalInputsProps) => {
  const enabledInputs = inputs
    .map((state, index) => ({ state, index, config: config[index] }))
    .filter((item) => item.config.enabled);

  if (enabledInputs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Entradas Digitais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {enabledInputs.map(({ state, index, config: ioConfig }) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <span className="text-sm font-medium text-center">{ioConfig.label}</span>
              <span className="text-xs text-muted-foreground">IN{index}</span>
              <div
                className={`w-4 h-4 rounded-full transition-colors ${
                  state === 1 ? "bg-success shadow-lg shadow-success/50" : "bg-inactive"
                }`}
              />
              <span className="text-xs font-mono">{state}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
