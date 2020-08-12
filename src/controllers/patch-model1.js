
export default function patchModel1Factory(editModel1) {
  return async function patchModel1(httpRequest) {
    try {
        await editModel1(httpRequest.body);
    } catch (error) {
        return '500';
    }
    return '201';
  };
}
