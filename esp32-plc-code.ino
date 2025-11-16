#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// =================================================================
// 1. CONFIGURAÇÕES GLOBAIS
// =================================================================

// --- CONFIGURAÇÕES DO MQTT ---
// SUBSTITUA pelos valores do seu broker MQTT
const char* mqtt_server = "SEU_BROKER_MQTT";
const int mqtt_port = 8883; // ou 1883 para não-SSL
const char* mqtt_user = "SEU_USUARIO";
const char* mqtt_pass = "SUA_SENHA";

// --- CERTIFICADO RAIZ (somente para conexão SSL) ---
const char* root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"COLE_SEU_CERTIFICADO_AQUI\n" \
"-----END CERTIFICATE-----\n";

// --- PINS ---
// Entradas Digitais (8)
const int DIGITAL_IN_PINS[8] = {32, 33, 34, 35, 36, 39, 15, 13};

// Entradas Analógicas (4)
const int ANALOG_IN_PINS[4] = {32, 33, 34, 35}; // ADC1

// Saídas de Relé (8)
const int RELAY_OUT_PINS[8] = {25, 26, 27, 14, 12, 13, 4, 16};

// =================================================================
// 2. VARIÁVEIS DE ESTADO
// =================================================================

// Estados das entradas/saídas
int digital_in[8] = {0};
int analog_in[4] = {0};
int relays_out[8] = {0};

// Identificação Única e Tópicos
char client_id[32];
char topic_status[64];
char topic_control[64];

// =================================================================
// 3. OBJETOS
// =================================================================

WiFiClientSecure espClient; // Ou WiFiClient para não-SSL
PubSubClient client(espClient);
WiFiManager wm;
Preferences preferences;

// =================================================================
// 4. FUNÇÕES MQTT
// =================================================================

void publishStatus() {
  if (!client.connected()) return;

  StaticJsonDocument<512> doc;
  
  // Arrays de status conforme esperado pelo dashboard
  JsonArray digital = doc.createNestedArray("digital_in");
  for (int i = 0; i < 8; i++) {
    digital.add(digital_in[i]);
  }
  
  JsonArray analog = doc.createNestedArray("analog_in");
  for (int i = 0; i < 4; i++) {
    analog.add(analog_in[i]);
  }
  
  JsonArray relays = doc.createNestedArray("relays_out");
  for (int i = 0; i < 8; i++) {
    relays.add(relays_out[i]);
  }

  char payload[512];
  serializeJson(doc, payload);

  client.publish(topic_status, payload, false);
  Serial.println("Status publicado:");
  Serial.println(payload);
}

void reconnect() {
  // Para SSL, descomente a linha abaixo
  // espClient.setCACert(root_ca);
  
  // Para não-SSL, use: espClient.setInsecure();
  espClient.setInsecure();

  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");

    if (client.connect(client_id, mqtt_user, mqtt_pass)) {
      Serial.println("Conectado ao MQTT!");
      
      // Subscrever ao tópico de controle
      client.subscribe(topic_control);
      Serial.print("Subscrito a: ");
      Serial.println(topic_control);
      
      // Publicar status inicial
      publishStatus();
    } else {
      Serial.print("Falha, rc=");
      Serial.print(client.state());
      Serial.println(" Tentando em 5 segundos...");
      delay(5000);
    }
  }
}

// =================================================================
// 5. LÓGICA DE CONTROLE E CALLBACK
// =================================================================

void applyRelayStates() {
  for (int i = 0; i < 8; i++) {
    digitalWrite(RELAY_OUT_PINS[i], relays_out[i]);
  }
}

void readInputs() {
  // Ler entradas digitais
  for (int i = 0; i < 8; i++) {
    digital_in[i] = digitalRead(DIGITAL_IN_PINS[i]);
  }
  
  // Ler entradas analógicas (0-4095 para ESP32)
  for (int i = 0; i < 4; i++) {
    analog_in[i] = analogRead(ANALOG_IN_PINS[i]);
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Comando recebido em ");
  Serial.print(topic);
  Serial.print(": ");

  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';
  Serial.println(message);

  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.println("Falha ao analisar JSON de comando.");
    return;
  }

  // Formato esperado: {"relay": index, "state": 0/1}
  if (doc.containsKey("relay") && doc.containsKey("state")) {
    int relay = doc["relay"].as<int>();
    int state = doc["state"].as<int>();
    
    if (relay >= 0 && relay < 8) {
      relays_out[relay] = state;
      applyRelayStates();
      
      Serial.print("Relé ");
      Serial.print(relay);
      Serial.print(" definido para ");
      Serial.println(state ? "ON" : "OFF");
      
      // Publicar status atualizado
      publishStatus();
    }
  }
}

// =================================================================
// 6. SETUP E LOOP PRINCIPAL
// =================================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n\nESP32 PLC Iniciando...");
  
  // Configuração dos pinos de entrada digital
  for (int i = 0; i < 8; i++) {
    pinMode(DIGITAL_IN_PINS[i], INPUT);
  }
  
  // Configuração dos pinos de relé (saída)
  for (int i = 0; i < 8; i++) {
    pinMode(RELAY_OUT_PINS[i], OUTPUT);
    digitalWrite(RELAY_OUT_PINS[i], LOW);
  }

  // --- WIFI MANAGER (PORTAL CATIVO) ---
  wm.setAPCallback([](WiFiManager *myWiFiManager) {
    Serial.println("Entrou no Portal Cativo (Modo AP)");
    Serial.print("AP: ");
    Serial.println(myWiFiManager->getConfigPortalSSID());
  });

  if (!wm.autoConnect("ESP32_PLC_SETUP", "senha123")) { 
    Serial.println("Falha de conexão Wi-Fi. Reiniciando...");
    delay(3000);
    ESP.restart();
  } 
  
  Serial.println("Conectado ao Wi-Fi!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // --- GERAÇÃO DE IDs E TÓPICOS ÚNICOS ---
  String mac = WiFi.macAddress();
  mac.replace(":", "");
  snprintf(client_id, 32, "plc-%s", mac.c_str());

  // Tópicos conforme esperado pelo dashboard
  snprintf(topic_status, 64, "plc/status/%s", mac.c_str());
  snprintf(topic_control, 64, "plc/control/%s", mac.c_str());
  
  Serial.println("\n=== INFORMAÇÕES DO DISPOSITIVO ===");
  Serial.print("MAC Address: ");
  Serial.println(mac);
  Serial.print("Client ID: ");
  Serial.println(client_id);
  Serial.print("Tópico Status: ");
  Serial.println(topic_status);
  Serial.print("Tópico Controle: ");
  Serial.println(topic_control);
  Serial.println("===================================\n");
  
  Serial.println("*** USE ESTE MAC NO DASHBOARD: ***");
  Serial.println(mac);
  Serial.println("***********************************\n");

  // --- CONFIGURAÇÃO MQTT ---
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  reconnect();
}

void loop() {
  // 1. Manutenção da conexão MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // 2. Lógica de Leitura e Publicação
  static unsigned long last_publish = 0;
  static unsigned long last_read = 0;
  const long READ_INTERVAL = 500;   // Ler entradas a cada 500ms
  const long PUBLISH_INTERVAL = 2000; // Publicar status a cada 2s

  unsigned long now = millis();

  // Leitura das entradas
  if (now - last_read > READ_INTERVAL) {
    readInputs();
    last_read = now;
  }

  // Publicação do status
  if (now - last_publish > PUBLISH_INTERVAL) {
    publishStatus();
    last_publish = now;
  }
}
