import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DigitalInputsProps {
  inputs: number[];
}

export const DigitalInputs = ({ inputs }: DigitalInputsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Digital Inputs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {inputs.map((state, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <span className="text-xs font-medium text-muted-foreground">IN{index}</span>
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
