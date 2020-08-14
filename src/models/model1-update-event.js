
export default function updateModel1EventFactory(uniqueId, time) {
  return async function updateModel1Event({ model1 }) {
    return Object.freeze({
      eventId: await uniqueId(),
      eventData: { ...model1 },
      updatedAt: await time()
    });
  }
}


