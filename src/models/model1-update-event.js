
export default function updateModel1EventFactory() {
  return async function updateModel1Event(model1) {
    return Object.freeze({
      eventData: { ...model1 },
    });
  }
}


