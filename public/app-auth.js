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

  //  const reader = new FileReader();
  //const token = reader.readAsText(file);

  //const accessToken =
  //   "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImpzTEIzNmEzZmJuS0VYb0MtWWlhNyJ9.eyJpc3MiOiJodHRwczovL2Rldi0yZmUyaWFyNi51cy5hdXRoMC5jb20vIiwic3ViIjoiRGRSSEg2dTVCc3FwclMwM3J0Z0ZEdjVwNnh6Q2RFVUtAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWljcm9saWIuaW8vIiwiaWF0IjoxNjE2Mzk4MTcyLCJleHAiOjE2MTY0ODQ1NzIsImF6cCI6IkRkUkhINnU1QnNxcHJTMDNydGdGRHY1cDZ4ekNkRVVLIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwicGVybWlzc2lvbnMiOltdfQ.b8JnCrMVrw8IcCpsiimLciWxld9uzsankmTrfagi7VKoHF2Tj7hbnkeYg4RZ_4jeKjiG0zlRVTPKvdFbI61FeFcu2w7suGNlsYfnfR7X9XK1998oQpXHp_D3IxOKECxn7yOL2UuJ3ytt4wUo2SSnGAPjkNYV315vJ0aB4gNvQFw7NNPZjF79sVMc2JTVBSWGob2Hl0Ucd7P01abmW1D1IJ-tLo45vIv_ouz6LDVhlRoPyQbnJGCROq-RCuo_xXepj6dNIoyhWD1HK8yx2hFW2Md0vcePHNmciaScvamd7sEgVF3xoEBCzevwEnhsrB-coDndWyRMowGLKrgjBbqGVA";
  let authHeader;

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
      headers: { "Content-Type": "application/json", ...authHeader },
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
      headers: { "Content-Type": "application/json", ...authHeader },
    })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  getButton.onclick = function () {
    document.getElementById("parameter").value = "";
    fetch(getUrl(), { headers: authHeader })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  deleteButton.onclick = function () {
    fetch(getUrl(), {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeader },
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

  copyButton.addEventListener("click", function () {
    modelIdInput.select();
    document.execCommand("copy");
  });

  window.addEventListener("load", async function () {
    // `npm run token` to refresh token
    // writes new token.json file to /public
    const file = await fetch("token.json");
    const text = await file.text();
    const token = JSON.parse(text);
    // add json web token to authentication header
    authHeader = { Authorization: `bearer ${token.access_token}` };
    // get list of all models and add to datalist for model input control
    const data = await fetch("microlib/api/config", { headers: authHeader });
    const models = await data.json();
    models.forEach(m => modelList.appendChild(new Option(m.endpoint)));
  });
})();
