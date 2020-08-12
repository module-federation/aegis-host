export const MODEL_NAME = 'model1';

export default function createModel1Factory(uniqueId, hash) {
  return async function createModel1({
    field1,
    field2,
    secret = field1 + field2
  } = {}) {
    if (!field1) {
      throw new Error('Field1 invalid or missing');
    }
    if (!field2) {
      throw new Error('Field2 invalid or missing');
    }
    return Object.freeze({
      id: await uniqueId(),
      modelName: MODEL_NAME,
      secret: await hash(secret),
      field1: field1,
      field2: field2
    });
  }
}
