import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalogInputsProps {
  inputs: number[];
}

export const AnalogInputs = ({ inputs }: AnalogInputsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Analog Inputs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputs.map((value, index) => {
            const percentage = (value / 4095) * 100;
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">AI{index}</span>
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
