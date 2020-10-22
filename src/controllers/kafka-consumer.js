import makeConsumer from '../use-cases/consume-events'
import { EventSource } from '../use-cases/consume-events'
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'fedmon',
  brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'test-group' });

const eventSource = EventSource(consumer, async (topic, callback) => {
  console.log('EventSource: topic: %s, callback: %s', topic, callback);
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: topic, fromBeginning: true });
    await consumer.run({
      eachMessage: callback
    });
  } catch (e) {
    throw e;
  }
});

export const consumeEvents = makeConsumer(eventSource);











