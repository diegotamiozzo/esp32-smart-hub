import { useEffect, useRef, useState } from "react";
import mqtt, { MqttClient } from "mqtt";
import { toast } from "sonner";

interface PlcStatus {
  digital_in: number[];
  analog_in: number[];
  relays_out: number[];
}

interface UseMqttClientProps {
  deviceMac: string;
  brokerUrl?: string;
}

export const useMqttClient = ({ deviceMac, brokerUrl = "wss://broker.hivemq.com:8884/mqtt" }: UseMqttClientProps) => {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<PlcStatus>({
    digital_in: Array(8).fill(0),
    analog_in: Array(4).fill(0),
    relays_out: Array(8).fill(0),
  });
  
  const clientRef = useRef<MqttClient | null>(null);
  const topicStatus = `plc/status/${deviceMac}`;
  const topicControl = `plc/control/${deviceMac}`;

  useEffect(() => {
    const client = mqtt.connect(brokerUrl, {
      clientId: `web-client-${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    client.on("connect", () => {
      console.log("MQTT Connected");
      setConnected(true);
      toast.success("Connected to MQTT broker");
      
      client.subscribe(topicStatus, (err) => {
        if (err) {
          console.error("Subscribe error:", err);
          toast.error("Failed to subscribe to status topic");
        } else {
          console.log("Subscribed to:", topicStatus);
        }
      });
    });

    client.on("message", (topic, payload) => {
      if (topic === topicStatus) {
        try {
          const data = JSON.parse(payload.toString()) as PlcStatus;
          setStatus(data);
        } catch (error) {
          console.error("Failed to parse status:", error);
        }
      }
    });

    client.on("error", (error) => {
      console.error("MQTT Error:", error);
      toast.error("MQTT connection error");
    });

    client.on("close", () => {
      console.log("MQTT Disconnected");
      setConnected(false);
    });

    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, [deviceMac, brokerUrl, topicStatus]);

  const controlRelay = (relayIndex: number, state: boolean) => {
    if (clientRef.current && connected) {
      const message = JSON.stringify({
        relay: relayIndex,
        state: state ? 1 : 0,
      });
      
      clientRef.current.publish(topicControl, message, (err) => {
        if (err) {
          console.error("Publish error:", err);
          toast.error(`Failed to control relay ${relayIndex}`);
        } else {
          console.log(`Relay ${relayIndex} set to ${state ? "ON" : "OFF"}`);
        }
      });
    }
  };

  return {
    connected,
    status,
    controlRelay,
  };
};
