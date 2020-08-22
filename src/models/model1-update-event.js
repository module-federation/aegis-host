
export default function updateModel1EventFactory() {
  return async function updateModel1Event({ updated, changes }) {
    return Object.freeze({
      updated: { ...updated },
      changes: { ...changes }
    });
  }
}


