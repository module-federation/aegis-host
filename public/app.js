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
    document.getElementById("url").textContent = [
      `http://${location.host}`,
      url,
    ].join("/");
  }

  function getUrl(add = () => "") {
    const model = document.getElementById("model").value;
    const id = document.getElementById("modelId").value;
    const url = ["api", model, id].join("/") + add();
    updateUrl(url);
    return url;
  }

  function addQuery() {
    const query = document.getElementById("query").value;
    if (query) {
      return `?${query}`;
    }
    return "";
  }

  function addParameter() {
    const param = document.getElementById("parameter").value;
    if (param) return param;
    return "";
  }

  modelText.onchange = getUrl;
  modelIdText.onchange = getUrl;
  queryText.onchange = () => getUrl(addQuery);
  paramText.onchange = () => getUrl(addParameter);

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
    fetch(getUrl(addParameter), {
      method: "POST",
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
    fetch(getUrl(addParameter), {
      method: "PATCH",
      body: document.getElementById("payload").value,
      headers: { "Content-Type": "application/json" },
    })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  getButton.onclick = function () {
    fetch(getUrl(addQuery))
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  deleteButton.onclick = function () {
    fetch(getUrl(), {
      method: "DELETE",
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
