import { useState, useEffect } from "react";
import { DeviceConfig, IOConfig } from "@/components/ConfigurationPanel";

const createDefaultIOConfig = (count: number, prefix: string): IOConfig[] => {
  return Array.from({ length: count }, (_, i) => ({
    enabled: true,
    label: `${prefix} ${i}`,
  }));
};

const DEFAULT_CONFIG: DeviceConfig = {
  relays: createDefaultIOConfig(8, "Relé"),
  digitalInputs: createDefaultIOConfig(8, "Entrada"),
  analogInputs: createDefaultIOConfig(4, "Analógica"),
};

export const useDeviceConfig = (deviceMac: string) => {
  const [config, setConfig] = useState<DeviceConfig>(DEFAULT_CONFIG);
  const storageKey = `plc-config-${deviceMac}`;

  useEffect(() => {
    if (deviceMac) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setConfig(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse stored config:", error);
          setConfig(DEFAULT_CONFIG);
        }
      }
    }
  }, [deviceMac, storageKey]);

  const saveConfig = (newConfig: DeviceConfig) => {
    setConfig(newConfig);
    if (deviceMac) {
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
    }
  };

  return { config, saveConfig };
};
