# Sistema de Controle PLC ESP32

Sistema completo de monitoramento e controle de PLC baseado em ESP32 com interface web via MQTT.

## 📋 Características

- **8 Entradas Digitais** (24V isoladas)
- **4 Entradas Analógicas** (0-10V / 4-20mA)
- **8 Saídas de Relé** (250VAC/10A)
- **Comunicação MQTT** via HiveMQ Cloud (TLS)
- **Interface Web Responsiva** (React + TypeScript)
- **Configuração WiFi** via WiFiManager

## 🔧 Hardware Necessário

### ESP32
- 8 pinos para entradas digitais: **32, 33, 25, 26, 27, 14, 12, 13**
- 4 pinos ADC para analógicas: **36, 39, 34, 35**
- 8 pinos para relés: **15, 2, 4, 16, 17, 5, 18, 19**

## 🚀 Configuração do ESP32

### 1. Bibliotecas Necessárias (Arduino IDE)

Instale via Library Manager:

```
- WiFiManager by tzapu
- PubSubClient by Nick O'Leary
- ArduinoJson by Benoit Blanchon
```

### 2. Upload do Código

1. Abra o arquivo `esp32-plc-code.ino`
2. Verifique as credenciais MQTT (já configuradas):
   - Servidor: `72c037df4ced415995ef95169a5c7248.s1.eu.hivemq.cloud`
   - Porta: `8883` (TLS)
   - Usuário: `esp32_cliente02`
   - Senha: `Corcel@73`
3. Compile e faça upload para o ESP32

### 3. Primeira Conexão WiFi

1. Após o upload, o ESP32 criará um ponto de acesso WiFi:
   - **SSID**: `PLC-CONFIG`
   - **Senha**: `12345678`

2. Conecte-se ao WiFi `PLC-CONFIG` pelo celular/notebook

3. Acesse `http://192.168.4.1` no navegador

4. Configure sua rede WiFi e clique em "Save"

5. O ESP32 reiniciará e conectará automaticamente

### 4. Identificando o MAC Address

Abra o **Serial Monitor** (115200 baud) e localize:

```
Topicos configurados:
plc/XXXXXXXXXXXX/status
plc/XXXXXXXXXXXX/control
```

Anote o **MAC Address** (12 caracteres) - você precisará dele na interface web.

## 💻 Configuração da Interface Web

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado com as credenciais do HiveMQ:

```env
VITE_MQTT_BROKER_URL=wss://72c037df4ced415995ef95169a5c7248.s1.eu.hivemq.cloud:8884/mqtt
VITE_MQTT_USERNAME=esp32_cliente02
VITE_MQTT_PASSWORD=Corcel@73
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

### 4. Build para Produção

```bash
npm run build
```

## 📡 Protocolo MQTT

### Tópicos

O sistema usa o MAC Address do ESP32 (sem `:`) para criar tópicos únicos:

- **Status** (ESP32 → Web): `plc/{MAC}/status`
- **Controle** (Web → ESP32): `plc/{MAC}/control`

### Formato JSON - Status (Publicado pelo ESP32)

```json
{
  "digital_in": [0, 1, 0, 1, 0, 0, 1, 0],
  "analog_in": [512, 1024, 2048, 3095],
  "relays_out": [0, 1, 0, 0, 1, 1, 0, 0]
}
```

### Formato JSON - Controle (Enviado pela Web)

```json
{
  "relay": 0,
  "state": 1
}
```

- `relay`: Índice do relé (0-7)
- `state`: Estado desejado (0=OFF, 1=ON)

## 🌐 Usando a Interface Web

### 1. Acessar o Sistema

Abra o navegador e acesse a aplicação.

### 2. Configurar Dispositivo

1. Clique no ícone de **configurações** (⚙️) no topo
2. Digite o **MAC Address** do ESP32 (12 caracteres, sem `:`)
3. Clique em **Salvar Configuração**

### 3. Monitorar e Controlar

- **Entradas Digitais**: Visualização em tempo real (verde=ativado, cinza=desativado)
- **Entradas Analógicas**: Valores de 0-4095 com barra de progresso
- **Relés**: Switches para ligar/desligar cada saída

### 4. Personalizar Labels

Na tela de configuração, você pode:
- Renomear cada entrada/saída
- Habilitar/desabilitar IOs individuais

## 🔍 Diagnóstico de Problemas

### ESP32 não conecta ao WiFi

1. Verifique se a rede WiFi está funcionando
2. Reconecte ao ponto de acesso `PLC-CONFIG` e reconfigure
3. Veja o Serial Monitor para mensagens de erro

### ESP32 não conecta ao MQTT

Verifique no Serial Monitor:

```
Conectando MQTT... OK!
Assinado: plc/XXXXXXXXXXXX/control
```

Se aparecer `Falhou (state=-2)`:
- Verifique conexão com internet
- Confirme credenciais MQTT
- Teste se a porta 8883 não está bloqueada

### Interface não recebe dados

1. Confirme que o **MAC Address** está correto na configuração
2. Abra o Console do navegador (F12) e verifique:
   - `MQTT Connected` ✅
   - `Subscribed to: plc/XXXXXXXXXXXX/status` ✅
3. Verifique se o ESP32 está publicando (Serial Monitor)

### Relés não respondem

1. Verifique se a conexão MQTT está ativa (indicador verde)
2. Confirme no Serial Monitor:
   ```
   Recebido [plc/XXXXXXXXXXXX/control]: {"relay":0,"state":1}
   ```
3. Teste os relés fisicamente com um multímetro

## 📊 Estrutura do Projeto

```
project/
├── esp32-plc-code.ino          # Código do ESP32
├── src/
│   ├── components/
│   │   ├── RelayControl.tsx    # Controle de relés
│   │   ├── DigitalInputs.tsx   # Entradas digitais
│   │   ├── AnalogInputs.tsx    # Entradas analógicas
│   │   └── ConfigurationPanel.tsx  # Configurações
│   ├── hooks/
│   │   ├── useMqttClient.ts    # Cliente MQTT
│   │   └── useDeviceConfig.ts  # Persistência de config
│   └── pages/
│       └── Index.tsx           # Página principal
└── .env                        # Configurações MQTT
```

## 🛡️ Segurança

- Conexão MQTT com TLS 1.2+
- Autenticação por usuário/senha
- Tópicos únicos por dispositivo (MAC Address)
- Sem exposição de credenciais no frontend

## 📝 Notas Técnicas

### Entradas Analógicas

- Resolução: 12 bits (0-4095)
- Tensão: 0-3.3V no ADC
- Use divisor de tensão para 0-10V ou conversor para 4-20mA

### Relés

- Carga máxima: 10A @ 250VAC / 30VDC
- Proteção por optoacoplador recomendada
- Adicione supressão de ruído (snubber) para cargas indutivas

### Taxa de Atualização

- ESP32 publica status a cada **2 segundos**
- Controle de relés: resposta imediata
- Interface web atualiza em tempo real

## 🐛 Debug Avançado

### Serial Monitor (ESP32)

```bash
# Informações importantes:
WiFi OK!
IP: 192.168.1.100
Topicos configurados:
plc/AABBCCDDEEFF/status
plc/AABBCCDDEEFF/control
Conectando MQTT... OK!
```

### Console do Navegador

```javascript
// Status da conexão
MQTT Connected
Subscribed to: plc/AABBCCDDEEFF/status

// Dados recebidos (a cada 2s)
{digital_in: Array(8), analog_in: Array(4), relays_out: Array(8)}

// Comandos enviados
Relay 0 set to ON
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique as mensagens no Serial Monitor do ESP32
2. Confira o Console do navegador (F12)
3. Confirme que MAC Address, usuário e senha MQTT estão corretos

## 🔄 Atualizações Futuras

- [ ] Autenticação de usuários
- [ ] Histórico de eventos
- [ ] Gráficos de tendência
- [ ] Alarmes configuráveis
- [ ] Suporte a múltiplos dispositivos
- [ ] API REST para integração

---

## 🔗 Links Úteis

**Lovable Project**: https://lovable.dev/projects/a3f92452-03d2-41dc-bc53-8d397fc095f4

**Tecnologias**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS

**Versão**: 1.0.0
**Licença**: MIT
