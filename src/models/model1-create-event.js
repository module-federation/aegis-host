
export default function createModel1EventFactory() {
  return async function createModel1Event(model1) {
    return Object.freeze({
      eventData: { ...model1 },
    });
  }
} 