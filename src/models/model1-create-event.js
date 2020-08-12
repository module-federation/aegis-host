const EVENT_NAME = 'createModel1Event';

export default function createModel1EventFactory(uniqueId) {
  return async function createModel1Event({ model1 }) {
    return Object.freeze({
      eventId: await uniqueId(),
      eventData: model1,
      eventName: EVENT_NAME,
      createTime: new Date().toUTCString()
    });
  }
}