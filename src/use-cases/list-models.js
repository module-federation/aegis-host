/**
 * 
 * @param {import('../datasources/datasource').default } repository 
 */
export default function listModelsFactory({ repository } = {}) {
  return async function listModels() {
    return repository.list();
  }
}