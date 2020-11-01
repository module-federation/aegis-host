
const { Kafka } = require('kafkajs');

(async () => {
  const kafka = new Kafka({
    clientId: 'fedmon',
    brokers: ['localhost:9092']
  })

  const producer = kafka.producer()

  await producer.connect()
  await producer.send({
    topic: 'orderShipped',
    messages: [
      { value: 'order shipped' },
    ],
  })

  await producer.disconnect()
})();