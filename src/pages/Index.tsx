import { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import { useDeviceConfig } from "@/hooks/useDeviceConfig";
import { toast } from "sonner";

type Page = "login" | "dashboard" | "settings";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [deviceMac, setDeviceMac] = useState("");

  const { config, saveConfig } = useDeviceConfig(deviceMac);

  useEffect(() => {
    const storedMac = localStorage.getItem("esp32_device_mac");
    if (storedMac) {
      setDeviceMac(storedMac);
      setCurrentPage("dashboard");
    }
  }, []);

  const handleConnect = (mac: string) => {
    setDeviceMac(mac);
    localStorage.setItem("esp32_device_mac", mac);
    setCurrentPage("dashboard");
    toast.success("Conectado ao dispositivo!");
  };

  const handleLogout = () => {
    localStorage.removeItem("esp32_device_mac");
    setDeviceMac("");
    setCurrentPage("login");
    toast.success("Desconectado com sucesso!");
  };

  const handleSettings = () => {
    setCurrentPage("settings");
  };

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard");
  };

  switch (currentPage) {
    case "login":
      return <Login onConnect={handleConnect} />;
    
    case "dashboard":
      return (
        <Dashboard
          deviceMac={deviceMac}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />
      );
    
    case "settings":
      return (
        <Settings
          deviceMac={deviceMac}
          config={config}
          onSave={saveConfig}
          onBack={handleBackToDashboard}
        />
      );
    
    default:
      return <Login onConnect={handleConnect} />;
  }
};

export default Index;