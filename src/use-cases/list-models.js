/**
 *
 * @param {import('../datasources/datasource').default } repository
 */
export default function listModelsFactory({ repository } = {}) {
  return async function listModels(query) {
    console.log("query", query);
    return repository.list(query);
  };
}
