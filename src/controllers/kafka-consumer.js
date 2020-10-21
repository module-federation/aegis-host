import makeConsumer from '../use-cases/consume-events'
import { EventSource } from '../use-cases/consume-events'
import { Kafka } from 'kafkajs';

const consumer = {} //new Kafka().consumer({ groupId: 'test-group' });

const eventSource = EventSource(consumer, async (topic, callback) => {
  console.log('EventSource: %s, %s', topic, callback);
  // await consumer.connect();
  // await consumer.subscribe({ topic: topic, fromBeginning: true });
  // await consumer.run({
  //   eachMessage: callback
  // });
});

export const consumeEvents = makeConsumer(eventSource);











