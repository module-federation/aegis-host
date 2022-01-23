;(function () {
  const apiRoot = 'aegis/api'
  const modelApiPath = apiRoot + '/models'
  const messages = document.querySelector('#messages')
  const postButton = document.querySelector('#post')
  const patchButton = document.querySelector('#patch')
  const getButton = document.querySelector('#get')
  const deleteButton = document.querySelector('#delete')
  const clearButton = document.querySelector('#clear')
  const modelInput = document.querySelector('#model')
  const modelIdInput = document.querySelector('#modelId')
  const queryInput = document.querySelector('#query')
  const paramInput = document.querySelector('#parameter')
  const copyButton = document.querySelector('#copyButton')
  const clearIdButton = document.querySelector('#clearIdButton')
  const clearQueryButton = document.querySelector('#clearQueryButton')
  const clearModelButton = document.querySelector('#clearModelButton')
  const clearParamButton = document.querySelector('#clearParamButton')
  const reloadModelButton = document.querySelector('#reloadModelButton')
  const progressBarControl = document.querySelector('#progressBarControl')
  const progressBarControlBar = document.querySelector('#progressBarControlBar')

  var exampleEl = document.getElementById('reloadModelButton')
  var tooltip = new bootstrap.Tooltip(exampleEl)

  // Include JWT access token in header for auth check
  let authHeader = {}

  /**
   * Returns headers, including auth header if auth is enabled.
   * @returns {{
   * "Content-Type":"application/json",
   * "Authorization": "bearer <token>"
   * }}
   */
  function getHeaders () {
    const content = { 'Content-Type': 'application/json' }
    return {
      ...content,
      ...authHeader
    }
  }

  /**
   * Get config file. If auth is enabled, request new
   * JSON Web Token and set `authHeader` accordingly.
   * Need CORS for this.
   */
  async function refreshAccessToken () {
    const file = await fetch('aegis.config.json')
    const text = await file.text()
    const config = JSON.parse(text).services.token
    let token = { access_token: '' }
    if (config.authEnabled) {
      const data = await fetch(config.oauthUri, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          client_id: config.client_id,
          client_secret: config.client_secret,
          audience: config.audience,
          grant_type: config.grant_type
        })
      })
      token = await data.json()
      // add json web token to authentication header
      authHeader = { Authorization: `bearer ${token.access_token}` }
    }
  }

  function prettifyJson (json) {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, null, 2)
    }
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = '<span>'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "<span class='text-warning'>"
          } else {
            cls = '<span>'
          }
        } else if (/true|false/.test(match)) {
          cls = "<span style='color: violet'>"
        } else if (/null/.test(match)) {
          cls = "<span class='text-info'>"
        }
        return cls + match + '</span>'
      }
    )
  }

  function displayUrl (url) {
    document.getElementById(
      'url'
    ).textContent = `${location.protocol}/${location.host}/${url}`
  }

  function getUrl () {
    const model = document.getElementById('model').value
    const id = document.getElementById('modelId').value
    const param = document.getElementById('parameter').value
    const query = document.getElementById('query').value
    let url = `${modelApiPath}/${model}`
    if (id) url += `/${id}`
    if (param) url += `/${param}`
    if (query) url += `?${query}`
    displayUrl(url)
    return url
  }

  modelInput.onchange = getUrl
  modelIdInput.onchange = getUrl
  queryInput.onchange = getUrl
  paramInput.onchange = getUrl

  function showMessage (message) {
    document.getElementById('jsonCode').innerHTML += `\n${prettifyJson(
      message
    )}`
    messages.scrollTop = messages.scrollHeight
  }

  function updateModelId (id) {
    if (id) modelIdInput.value = id
  }

  function handleResponse (response) {
    try {
      return [200, 201, 400].includes(response.status)
        ? response.json().then(function (data) {
            updateModelId(data.modelId)
            return JSON.stringify(data, null, 2)
          })
        : Promise.reject(
            new Error([response.status, response.statusText].join(': '))
          )
    } catch (error) {
      return error.message
    }
  }

  function makeProgress (stop) {
    var stop = false
    var i = 0
    //progressElem.style.visibility = 'visible'
    var bar = document.querySelector('.progress-bar')
    function progress () {
      if (i < 100) {
        i = i + 1
        bar.style.width = i + '%'
        bar.innerText = i + '%'
      }
      // Wait for sometime before running this script again
      setTimeout(() => {
        if (!stop) progress()
        else {
          bar.style.width = 100 + '%'
          bar.innerText = 100 + '%'
          //setTimeout(() => (progressElem.style.visibility = 'hidden'), 100)
        }
      }, 100)
    }

    return {
      done () {
        stop = true
      },
      progress
    }
  }

  const progressController = stop => {
    //const modalControl = new bootstrap.Modal(document.getElementById('modal'))
    //const collapsable = document.querySelector('')
    if (stop) {
      return {
        hide () {}
      }
    }
    const progressBarControl = document.querySelector('.progress')
    const progressControl = makeProgress(stop)
    const collapse = new bootstrap.Collapse(progressBarControl)

    return {
      show () {
        collapse.show()
        progressControl.progress()
        //modalControl.show()
      },
      hide () {
        stop = true
        collapse.hide()
        progressControl.done()
        //amodalControl.hide()
      },
      dispose () {
        collapse.dispose()
      }
    }
  }
  let loaded = false
  let reloaded = false

  reloadModelButton.onclick = function () {
    const endpoint = document.getElementById('model').value
    const len = endpoint.length
    let modelName = endpoint
    if (endpoint.charAt(len - 1) === 's') modelName = endpoint.slice(0, len - 1)

    // let stop = false
    // const controller = progressController(stop)
    // let timerId
    // if (!reloaded) {
    //   timerId = setTimeout(() => controller.show(), 2000)
    // }
    fetch(`${modelApiPath}/reload?modelName=${modelName}`, {
      method: 'PUT',
      headers: getHeaders()
    })
      // .then(response => {
      //   if (!reloaded) {
      //     clearTimeout(timerId)
      //     controller.hide()
      //     reloaded = true
      //   }
      //   return response
      // })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message)
      })
  }

  postButton.onclick = function () {
    document.getElementById('modelId').value = ''
    // let stop = false
    // const controller = progressController(stop)
    // let timerId
    // if (!loaded) {
    //   timerId = setTimeout(() => controller.show(), 2000)
    // }

    fetch(getUrl(), {
      method: 'POST',
      body: document.getElementById('payload').value,
      headers: getHeaders()
    })
      // .then(response => {
      //   if (!loaded) {
      //     clearTimeout(timerId)
      //     controller.hide()
      //     controller.dispose()
      //     loaded = true
      //   }
      //   return response
      // })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message)
      })
  }

  patchButton.onclick = function () {
    document.getElementById('query').value = ''
    fetch(getUrl(), {
      method: 'PATCH',
      body: document.getElementById('payload').value,
      headers: getHeaders()
    })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message)
      })
  }

  getButton.onclick = function () {
    document.getElementById('parameter').value = ''
    fetch(getUrl(), { headers: getHeaders() })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message)
      })
  }

  deleteButton.onclick = function () {
    fetch(getUrl(), { method: 'DELETE', headers: getHeaders() })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message)
      })
  }

  clearButton.onclick = function () {
    document.getElementById('jsonCode').innerHTML = ''
  }

  copyButton.addEventListener('click', function () {
    modelIdInput.select()
    document.execCommand('copy')
  })

  clearModelButton.addEventListener('click', function () {
    document.getElementById('model').value = ''
    document.getElementById('modelId').value = ''
    document.getElementById('query').value = ''
    document.getElementById('parameter').value = ''
    getUrl()
  })

  clearIdButton.addEventListener('click', function () {
    document.getElementById('modelId').value = ''
    document.getElementById('parameter').value = ''
    getUrl()
  })

  clearParamButton.addEventListener('click', function () {
    document.getElementById('parameter').value = ''
    getUrl()
  })

  clearQueryButton.addEventListener('click', function () {
    document.getElementById('query').value = ''
    getUrl()
  })

  window.addEventListener('load', async function () {
    // if enabled, request fresh access token and store in auth header
    await refreshAccessToken()
    // get list of all models and add to datalist for model input control
    const data = await fetch('aegis/api/config?isCached=false', {
      headers: getHeaders()
    })
    const models = await data.json()
    models.forEach(m => modelList.appendChild(new Option(m.endpoint)))
  })
})()
