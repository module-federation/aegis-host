export const EVENT_NAME = 'updateModel1Event';

export default function updateModel1EventFactory(uniqueId) {
  return async function updateModel1Event({ model1 }) {
    return Object.freeze({
      eventId: await uniqueId(),
      eventData: { ...model1 },
      eventName: EVENT_NAME,
      updateTime: new Date().toUTCString()
    });
  }
}


