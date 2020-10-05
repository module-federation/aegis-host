
/**
 *
 */
export default async () => {
  const importStartTime = Date.now();

  const models = await import('fedmonserv/models');

  console.log("\n%dms to import remote models\n", Date.now() - importStartTime);

  return models;
}