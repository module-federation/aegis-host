import log from '../lib/logger';

export default function patchModel1Factory(editModel1) {
  return async function patchModel1(httpRequest) {
    try {
      const { source = {}, ...modelInfo } = httpRequest.body
      log({ function: 'patchModel1', ...modelInfo });

      source.ip = httpRequest.ip
      source.browser = httpRequest.headers['User-Agent']
      if (httpRequest.headers['Referer']) {
        source.referrer = httpRequest.headers['Referer']
      }
      const id = httpRequest.params.id;
      log(source);

      const model = await editModel1(id, { ...modelInfo });
      log({ function: 'editModel1', modelData: { ...model } });

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
