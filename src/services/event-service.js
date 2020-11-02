'use strict'

import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'fedmon',
  brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'test-group' });
const producer = kafka.producer();

export const Event = {

  async listen(topic, callback) {
    console.log('listen: topic: %s, callback: %s', topic, callback);
    try {
      await consumer.connect();
      await consumer.subscribe({ topic: topic, fromBeginning: true });
      await consumer.run({
        eachMessage: async ({ topic, message }) => callback({
          topic, message: message.value.toString()
        })
      });
    } catch (e) {
      throw e;
    }
  },

  async notify(topic, message) {
    await producer.connect()
    await producer.send({
      topic: topic,
      messages: [
        { value: message },
      ],
    });
    await producer.disconnect();
  }
}








