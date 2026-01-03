// ------------------------------------------------------------
// ESP32 + WiFiManager + HiveMQ Cloud TLS + I/O (8DI, 4AI, 8RO)
// ------------------------------------------------------------

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ----- CONFIG HIVE MQ -----
const char* mqtt_server = "72c037df4ced415995ef95169a5c7248.s1.eu.hivemq.cloud";
const int   mqtt_port   = 8883;

const char* mqtt_user = "esp32_cliente02";
const char* mqtt_pass = "Corcel@73";

// ----- PINOS -----
const int NUM_DIGITAL_INPUTS = 8;
const int NUM_ANALOG_PINS  = 4;
const int NUM_RELAY_OUTPUTS  = 8;

byte digitalInputPins[NUM_DIGITAL_INPUTS] = {32, 33, 25, 26, 27, 14, 12, 13};
byte analogInputPins [NUM_ANALOG_PINS]  = {36, 39, 34, 35};
byte relayOutputPins [NUM_RELAY_OUTPUTS]  = {15, 2, 4, 16, 17, 5, 18, 19};

byte relayStates[NUM_RELAY_OUTPUTS] = {0};

// MQTT
WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

// MAC / tópicos
String deviceMac;
String topicStatus;
String topicControl;

// Timer
unsigned long lastPublish = 0;
const unsigned long PUBLISH_INTERVAL = 2000;

// ------------------------------------------------------------
// CALLBACK MQTT → controle de relés
// ------------------------------------------------------------
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Recebido [");
  Serial.print(topic);
  Serial.print("]: ");

  char msg[length + 1];
  memcpy(msg, payload, length);
  msg[length] = '\0';
  Serial.println(msg);

  StaticJsonDocument<128> doc;
  auto error = deserializeJson(doc, msg);

  if (error) {
    Serial.println("Erro no JSON recebido!");
    return;
  }

  if (!doc.containsKey("relay") || !doc.containsKey("state")) return;

  int index = doc["relay"];
  int state = doc["state"];

  if (index < 0 || index >= NUM_RELAY_OUTPUTS) return;

  digitalWrite(relayOutputPins[index], state);
  relayStates[index] = state;

  // feedback imediato
  publishStatus();
}

// ------------------------------------------------------------
// RECONNECT MQTT
// ------------------------------------------------------------
void connectMqtt() {
  while (!mqttClient.connected()) {
    Serial.print("Conectando MQTT... ");

    String clientId = "ESP32_" + deviceMac;

    if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("OK!");

      mqttClient.subscribe(topicControl.c_str());
      Serial.print("Assinado: ");
      Serial.println(topicControl);

    } else {
      Serial.print("Falhou (state=");
      Serial.print(mqttClient.state());
      Serial.println(") → 5s");
      delay(5000);
    }
  }
}

// ------------------------------------------------------------
// WIFI + CRIAÇÃO DOS TÓPICOS
// ------------------------------------------------------------
void setupWifi() {
  WiFiManager wm;

  if (!wm.autoConnect("ESP32_IOT_SETUP", "senha123")) {
    Serial.println("Erro no WiFi. Reiniciando...");
    delay(2000);
    ESP.restart();
  }

  Serial.println("WiFi OK!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  deviceMac = WiFi.macAddress();
  deviceMac.replace(":", "");

  topicStatus  = "plc/" + deviceMac + "/status";
  topicControl = "plc/" + deviceMac + "/control";

  Serial.println("Topicos configurados:");
  Serial.println(topicStatus);
  Serial.println(topicControl);
}

// ------------------------------------------------------------
// PUBLICAÇÃO DO JSON DE STATUS
// ------------------------------------------------------------
void publishStatus() {

  StaticJsonDocument<512> doc;

  JsonArray di = doc.createNestedArray("digital_in");
  for (int i = 0; i < NUM_DIGITAL_INPUTS; i++)
    di.add(digitalRead(digitalInputPins[i]));

  JsonArray ai = doc.createNestedArray("analog_in");
  for (int i = 0; i < NUM_ANALOG_PINS; i++)
    ai.add(analogRead(analogInputPins[i]));

  JsonArray ro = doc.createNestedArray("relays_out");
  for (int i = 0; i < NUM_RELAY_OUTPUTS; i++)
    ro.add(relayStates[i]);

  char buffer[512];
  size_t len = serializeJson(doc, buffer);

  mqttClient.publish(topicStatus.c_str(), buffer, len);
}

// ------------------------------------------------------------
// SETUP
// ------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(500);

  // Pinos
  for (int i = 0; i < NUM_DIGITAL_INPUTS; i++)
    pinMode(digitalInputPins[i], INPUT);

  for (int i = 0; i < NUM_RELAY_OUTPUTS; i++) {
    pinMode(relayOutputPins[i], OUTPUT);
    digitalWrite(relayOutputPins[i], LOW);
  }

  // WiFi Manager
  setupWifi();

  // TLS sem root_ca
  wifiClient.setInsecure();

  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
}

// ------------------------------------------------------------
// LOOP
// ------------------------------------------------------------
void loop() {
  if (!mqttClient.connected())
    connectMqtt();

  mqttClient.loop();

  if (millis() - lastPublish > PUBLISH_INTERVAL) {
    lastPublish = millis();
    publishStatus();
  }
}
