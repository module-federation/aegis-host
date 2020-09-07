export default async () => {
  const fnFactory = (await import('fedmonserv/create-model2')).default;
  const factory = fnFactory();
  console.log({ factory: factory });
  return factory;
}