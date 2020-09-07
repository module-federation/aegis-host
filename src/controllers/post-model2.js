import log from '../lib/logger';

export default function postModel2Factory(addModel2) {
  return async function postModel2(httpRequest) {
    try {
      const { ...modelInfo } = httpRequest.body
      log({ function: 'postModel2', ...modelInfo });

      const model = await addModel2({ ...modelInfo });
      log({ function: 'addModel2', modelData: { ...model } });

      return {
        headers: {
          'Content-Type': 'application/json',
          'Last-Modified': new Date().toUTCString()
        },
        statusCode: 201,
        body: { modelId: model.id }
      }
    } catch (e) {
      log(e);

      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: 400,
        body: {
          error: e.message
        }
      }
    }
  }
}
