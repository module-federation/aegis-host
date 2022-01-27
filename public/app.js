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
  const reloadTip = document.getElementById('reloadModelButton')
  const progresscntrl = document.getElementById('progresscntrl')
  const progressbar = document.getElementById('progressbar')
  const progressbarCollapse = new bootstrap.Collapse(progresscntrl, {
    toggle: false
  })

  new bootstrap.Tooltip(reloadTip)

  class ProgressBar {
    constructor (progressbar, events) {
      this.progressbar = progressbar // Progress Bar
      this.events = events // Step Complete Btns
      this.progress = 0 // Tracking Progress
    }

    init () {
      const context = this
      // Reference to the instantiated object.
      this.events.forEach(function (event) {
        // add events
        window.addEventListener(event, function (e) {
          context.makeProgress(e.detail.progress)
        })
      })
    }

    makeProgress (progress) {
      this.progressbar.style.width = progress + '%'
      this.progressbar.setAttribute('aria-valuenow', progress)
    }
  }

  const progressBar = new ProgressBar(
    // passing in reference to progress-bar div
    progressbar,
    // array of events to subscribe to
    ['fetch-connect', 'fetch-read', 'fetch-done']
  )

  progressBar.init()

  async function instrumentedFetch (url, options) {
    window.dispatchEvent(
      new CustomEvent('fetch-connect', { detail: { progress: 35 } })
    )

    let response = await fetch(url, options)

    window.dispatchEvent(
      new CustomEvent('fetch-connect', { detail: { progress: 50 } })
    )

    const reader = response.body.getReader()
    const contentLength = response.headers.get('Content-Length')
    let receivedLength = 0
    let ratio = 0
    let chunks = []

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }
      receivedLength += value.length
      chunks.push(value)

      ratio = (contentLength / receivedLength) * 100
      window.dispatchEvent(
        new CustomEvent('fetch-read', { detail: { progress: ratio / 2 + 50 } })
      )
    }
    console.debug({ receivedLength })
    let chunksAll = new Uint8Array(receivedLength)
    let position = 0
    for (let chunk of chunks) {
      chunksAll.set(chunk, position)
      position += chunk.length
    }
    let result = new TextDecoder('utf-8').decode(chunksAll)
    console.debug({ result })

    window.dispatchEvent(
      new CustomEvent('fetch-done', { detail: { progress: 100 } })
    )

    return JSON.parse(result)
  }

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

  function modelNameFromEndpoint () {
    const endpoint = document.getElementById('model').value
    const len = endpoint.length
    if (endpoint.charAt(len - 1) === 's') return endpoint.slice(0, len - 1)
    return endpoint
  }

  reloadModelButton.onclick = function () {
    progressbarCollapse.show() // show progress bar
    const modelName = modelNameFromEndpoint()
    instrumentedFetch(`${modelApiPath}/reload?modelName=${modelName}`, {
      method: 'PUT',
      headers: getHeaders()
    })
      .then(showMessage)
      .then(() => setTimeout(() => progressbarCollapse.hide(), 1000))
      .catch(function (err) {
        showMessage(err.message)
      })
  }

  postButton.onclick = function () {
    document.getElementById('modelId').value = ''
    const timerId = setTimeout(() => progressbarCollapse.show(), 1000)
    instrumentedFetch(getUrl(), {
      method: 'POST',
      body: document.getElementById('payload').value,
      headers: getHeaders()
    })
      .then(data => {
        clearTimeout(timerId)
        setTimeout(() => progressbarCollapse.hide(), 1000)
        updateModelId(data.modelId)
        return data
      })
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
