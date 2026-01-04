import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConfigurationPanel, DeviceConfig } from "@/components/ConfigurationPanel";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface SettingsProps {
  deviceMac: string;
  config: DeviceConfig;
  onSave: (config: DeviceConfig) => void;
  onBack: () => void;
}

const Settings = ({ deviceMac, config, onSave, onBack }: SettingsProps) => {
  // ✅ Estado local para armazenar as mudanças temporárias
  const [tempConfig, setTempConfig] = useState<DeviceConfig>(config);

  // ✅ Atualiza o estado local quando o config muda
  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleSave = () => {
    onSave(tempConfig);
    toast.success("Configuração salva com sucesso!");
    onBack();
  };

  const handleCancel = () => {
    setTempConfig(config); // Reverte as mudanças
    onBack();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-sm text-muted-foreground">
              Dispositivo: {deviceMac}
            </p>
          </div>
        </div>

        {/* Configuration Panel */}
        <ConfigurationPanel
          config={tempConfig}
          onConfigChange={setTempConfig}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default Settings;