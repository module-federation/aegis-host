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

  function prettifyJson(json) {
    if (typeof json !== "string") {
      json = JSON.stringify(json, null, 2);
    }
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = "<span>";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "<span class='text-warning'>";
          } else {
            cls = "<span>";
          }
        } else if (/true|false/.test(match)) {
          cls = "<span class='text-light'>";
        } else if (/null/.test(match)) {
          cls = "<span class='text-info'>";
        }
        return cls + match + "</span>";
      }
    );
  }

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
    document.getElementById("jsonCode").innerHTML = prettifyJson(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function updateModelId(id) {
    if (id) modelIdText.value = id;
  }

  function handleResponse(response) {
    try {
      return [200, 201, 400].includes(response.status)
        ? response.json().then(function (data) {
            updateModelId(data.modelId);
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
    fetch(getUrl(), {
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
    fetch(getUrl(), {
      method: "PATCH",
      body: document.getElementById("payload").value,
      headers: { "Content-Type": "application/json" },
    })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
    q;
  };

  getButton.onclick = function () {
    document.getElementById("parameter").value = "";
    fetch(getUrl())
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
    document.getElementById("jsonCode").innerHTML = "";
  };
})();
