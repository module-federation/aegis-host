
/**
 *
 */
export default async () => {
  const models = (await import('fedmonserv/models')).default;
  return models;
}