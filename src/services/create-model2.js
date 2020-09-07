import log from '../lib/logger';

export default async () => {
  const fnFactory = (await import('fedmonserv/create-model2')).default;
  const factory = fnFactory();
  return factory;
}