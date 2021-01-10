
(function () {
  const messages = document.querySelector('#messages');
  const postButton = document.querySelector('#post');
  const patchButton = document.querySelector('#patch');
  const getButton = document.querySelector('#get');
  const deleteButton = document.querySelector('#delete');
  const clearButton = document.querySelector('#clear');
  const modelText = document.querySelector('#model');
  const modelIdText = document.querySelector('#modelId');
  const queryText = document.querySelector("#query");

  function updateUrl(url) {
    document.getElementById('url').textContent = [
      `http://${location.host}`,
      url
    ].join('/');
  }

    function getQuery() {
      const query = document.getElementById("query").value;
      console.log(query);
      if (query) {
        return `?${query}`;
      }
      return "";
    }

  function getUrl(getQuery = () => "") {
    const model = document.getElementById('model').value;
    const id = document.getElementById('modelId').value;
    const url = ['api', model, id].join('/') + getQuery();
    updateUrl(url);
    return url;
  }

  modelText.onchange = getUrl;
  modelIdText.onchange = getUrl;

  function showMessage(message) {
    messages.textContent += `\n${message}`;
    messages.scrollTop = messages.scrollHeight;
  }

  function updateModelId(modelId) {
    modelIdText.value = modelId;
  }

  function handleResponse(response) {
    try {
      return [200, 201, 400].includes(response.status)
        ? response.json().then(function(data) {
          if (data.modelId) {
            updateModelId(data.modelId);
            getUrl();
          }
          return JSON.stringify(data, null, 2);
        })
        : Promise.reject(new Error([
          response.status,
          response.statusText
        ].join(': ')));
    } catch (error) {
      return error.message;
    }
  }

  postButton.onclick = function () {
    fetch(getUrl(), {
      method: "POST",
      body: document.getElementById('payload').value,
      headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  }

  patchButton.onclick = function () {
    fetch(getUrl(), {
      method: "PATCH",
      body: document.getElementById('payload').value,
      headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  }

  getButton.onclick = function () {
    fetch(getUrl(getQuery))
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  }

  deleteButton.onclick = function () {
    fetch(getUrl(), {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  }

  clearButton.onclick = function () {
    messages.textContent = '';
  }

})();