
const { Kafka } = require('kafkajs');

(async () => {
  const kafka = new Kafka({
    clientId: 'fedmon',
    brokers: ['localhost:9092']
  })

  const producer = kafka.producer()

  await producer.connect()
  await producer.send({
    topic: 'shipping',
    messages: [
      { value: '{ eventName: ORDERSHIPPED, orderNo: 123 }' },
    ],
  })

  await producer.disconnect()
})();