import log from '../lib/logger';

export default function getModelFactory(listModel) {
  return async function getModel(httpRequest) {
    log({ function: 'getModel1' });
    try {
      const { source = {} } = httpRequest.body
      source.ip = httpRequest.ip
      source.browser = httpRequest.headers['User-Agent']
      if (httpRequest.headers['Referer']) {
        source.referrer = httpRequest.headers['Referer']
      }
      log(source);

      const models = await listModel();
      log({ function: listModel.name, ...models });

      return {
        headers: {
          'Content-Type': 'application/json',
          'Last-Modified': Date.now().toLocaleString()
        },
        statusCode: 200,
        body: { models }
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
