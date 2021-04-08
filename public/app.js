(function () {
  const apiRoot = "microlib/api";
  const modelApiPath = apiRoot + "/models";
  const messages = document.querySelector("#messages");
  const postButton = document.querySelector("#post");
  const patchButton = document.querySelector("#patch");
  const getButton = document.querySelector("#get");
  const deleteButton = document.querySelector("#delete");
  const clearButton = document.querySelector("#clear");
  const modelInput = document.querySelector("#model");
  const modelIdInput = document.querySelector("#modelId");
  const queryInput = document.querySelector("#query");
  const paramInput = document.querySelector("#parameter");
  const copyButton = document.querySelector("#copyButton");

  // Include JWT access token in header for auth check
  let authHeader = {};

  /**
   * Returns headers, including auth header if auth is enabled.
   * @returns {{
   * "Content-Type":"application/json",
   * "Authorization": "bearer <token>"
   * }}
   */
  function getHeaders() {
    const contentHeader = { "Content-Type": "application/json" };
    return {
      ...contentHeader,
      ...authHeader,
    };
  }

  /**
   * Get config file. If auth is enabled, request new
   * JSON Web Token and set `authHeader` accordingly.
   * Need CORS for this.
   */
  async function refreshAccessToken() {
    const file = await fetch("config.json");
    const text = await file.text();
    const config = JSON.parse(text);
    let token = { access_token: "" };
    if (config.authEnabled) {
      const data = await fetch(config.oauthUri, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          client_id: config.client_id,
          client_secret: config.client_secret,
          audience: config.audience,
          grant_type: config.grant_type,
        }),
      });
      token = await data.json();
      // add json web token to authentication header
      authHeader = { Authorization: `bearer ${token.access_token}` };
    }
  }

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
          cls = "<span style='color: violet'>";
        } else if (/null/.test(match)) {
          cls = "<span class='text-info'>";
        }
        return cls + match + "</span>";
      }
    );
  }

  function displayUrl(url) {
    document.getElementById(
      "url"
    ).textContent = `${location.protocol}${location.host}/${url}`;
  }

  function getUrl() {
    const model = document.getElementById("model").value;
    const id = document.getElementById("modelId").value;
    const param = document.getElementById("parameter").value;
    const query = document.getElementById("query").value;
    let url = `${modelApiPath}/${model}`;
    if (id) url += `/${id}`;
    if (param) url += `/${param}`;
    if (query) url += `?${query}`;
    displayUrl(url);
    return url;
  }

  modelInput.onchange = getUrl;
  modelIdInput.onchange = getUrl;
  queryInput.onchange = getUrl;
  paramInput.onchange = getUrl;

  function showMessage(message) {
    document.getElementById("jsonCode").innerHTML += `\n${prettifyJson(
      message
    )}`;
    messages.scrollTop = messages.scrollHeight;
  }

  function updateModelId(id) {
    if (id) modelIdInput.value = id;
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
    document.getElementById("modelId").value = "";
    fetch(getUrl(), {
      method: "POST",
      body: document.getElementById("payload").value,
      headers: getHeaders(),
    })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  patchButton.onclick = function () {
    document.getElementById("query").value = "";
    fetch(getUrl(), {
      method: "PATCH",
      body: document.getElementById("payload").value,
      headers: getHeaders(),
    })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  getButton.onclick = function () {
    document.getElementById("parameter").value = "";
    fetch(getUrl(), { headers: getHeaders() })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  deleteButton.onclick = function () {
    fetch(getUrl(), { method: "DELETE", headers: getHeaders() })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  clearButton.onclick = function () {
    document.getElementById("jsonCode").innerHTML = "";
  };

  copyButton.addEventListener("click", function () {
    modelIdInput.select();
    document.execCommand("copy");
  });

  window.addEventListener("load", async function () {
    // if enabled, request fresh access token and store in auth header
    await refreshAccessToken();
    // get list of all models and add to datalist for model input control
    const data = await fetch("microlib/api/config", { headers: getHeaders() });
    const models = await data.json();
    models.forEach(m => modelList.appendChild(new Option(m.endpoint)));
  });
})();
