
export default function createModel1EventFactory(uniqueId, timeStamp) {
  return async function createModel1Event(model1) {
    return /*Object.freeze(*/{
      eventId: await uniqueId(),
      eventData: { ...model1 },
      createdAt: await timeStamp()
    }/*)*/;
  }
} 