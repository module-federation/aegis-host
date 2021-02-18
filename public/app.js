(function () {
  const messages = document.querySelector("#messages");
  const postButton = document.querySelector("#post");
  const patchButton = document.querySelector("#patch");
  const getButton = document.querySelector("#get");
  const deleteButton = document.querySelector("#delete");
  const clearButton = document.querySelector("#clear");
  const modelText = document.querySelector("#model");
  const modelIdText = document.querySelector("#modelId");
  const queryText = document.querySelector("#query");
  const paramText = document.querySelector("#parameter");

  function updateUrl(url) {
    document.getElementById(
      "url"
    ).textContent = `http://${location.host}/${url}`;
  }

  function getUrl() {
    const model = document.getElementById("model").value;
    const id = document.getElementById("modelId").value;
    const param = document.getElementById("parameter").value;
    const query = document.getElementById("query").value;
    let url = `api/${model}`; 
    if (id) url += `/${id}`;
    if (param) url += `/${param}`;
    if (query) url += `?${query}`;
    updateUrl(url);
    return url;
  }

  modelText.onchange = getUrl;
  modelIdText.onchange = getUrl;
  queryText.onchange = getUrl;
  paramText.onchange = getUrl;

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
        ? response.json().then(function (data) {
            if (data.modelId) {
              updateModelId(data.modelId);
              getUrl();
            }
            return JSON.stringify(data, null, 2);
          })
        : Promise.reject(
            new Error([response.status, response.statusText].join(": "))
          );
    } catch (error) {
      return error.message;
    }
  }

  postButton.onclick = function () {
    const method = "POST";
    fetch(getUrl(method), {
      method,
      body: document.getElementById("payload").value,
      headers: { "Content-Type": "application/json" },
    })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  patchButton.onclick = function () {
    const method = "PATCH";
    fetch(getUrl(method), {
      method,
      body: document.getElementById("payload").value,
      headers: { "Content-Type": "application/json" },
    })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });q
  };

  getButton.onclick = function () {
    document.getElementById("parameter").value = "";
    fetch(getUrl("GET"))
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  deleteButton.onclick = function () {
    const method = "DELETE";
    fetch(getUrl(method), {
      method,
      headers: { "Content-Type": "application/json" },
    })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  clearButton.onclick = function () {
    messages.textContent = "";
  };
})();
