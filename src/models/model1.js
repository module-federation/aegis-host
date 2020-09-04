export const MODEL_NAME = 'model1';

export default function createModel1Factory(hash) {
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
      secret: hash(secret),
      field1,
      field2
    });
  }
}

export function validateModel1Factory() {
  return function validateModel1() {
    return this.field1 && this.field2;
  }
}