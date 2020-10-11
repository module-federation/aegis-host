import remoteEntries from '../../webpack/remote-entries';
/**
 *
 */
export default async () => {
  const importStartTime = Date.now();
  const models = await remoteEntries[0].importRemote();
  console.log("\n%dms to import remote models\n", Date.now() - importStartTime);
  return models;
}