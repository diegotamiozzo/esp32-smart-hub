import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IOConfig } from "@/components/ConfigurationPanel";

interface AnalogInputsProps {
  inputs: number[];
  config: IOConfig[];
}

export const AnalogInputs = ({ inputs, config }: AnalogInputsProps) => {
  const enabledInputs = inputs
    .map((value, index) => ({ value, index, config: config[index] }))
    .filter((item) => item.config.enabled);

  if (enabledInputs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Entradas Analógicas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enabledInputs.map(({ value, index, config: ioConfig }) => {
            const percentage = (value / 4095) * 100;
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{ioConfig.label}</span>
                  <span className="text-xs text-muted-foreground">AI{index}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono text-muted-foreground">
                    {value} / 4095
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
