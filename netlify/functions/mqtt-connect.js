import mqtt from 'mqtt'

export const handler = async (event) => {
  try {
    const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      connectTimeout: 5000
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Conexão MQTT criada no servidor'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
