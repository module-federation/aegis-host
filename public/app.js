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
  const portInput = document.querySelector('#port')
  const copyButton = document.querySelector('#copyButton')
  const clearIdButton = document.querySelector('#clearIdButton')
  const clearQueryButton = document.querySelector('#clearQueryButton')
  const clearModelButton = document.querySelector('#clearModelButton')
  const clearParamButton = document.querySelector('#clearParamButton')
  const clearPortsButton = document.querySelector('#clearPortsButton')
  const reloadModelButton = document.querySelector('#reloadModelButton')

  let models
  class ProgressBar {
    constructor (events) {
      this.progresscntrl = document.getElementById('progresscntrl')
      this.progressbar = document.getElementById('progressbar')
      this.collapse = new bootstrap.Collapse(this.progresscntrl, {
        toggle: false
      })
      this.events = events
      this.progress = 0
      this.progressbar.style.width = '0%'
      this.progressbar.setAttribute('aria-valuenow', 0)
      const context = this
      this.events.forEach(function (event) {
        // add events
        window.addEventListener(event, function (e) {
          context.makeProgress(e.detail.progress)
        })
      })
    }

    show () {
      this.collapse.show()
    }

    hide () {
      this.collapse.hide()
    }

    makeProgress (progress) {
      this.progressbar.style.width = progress + '%'
      this.progressbar.setAttribute('aria-valuenow', progress)
    }
  }

  async function instrumentedFetch (url, options) {
    window.dispatchEvent(
      new CustomEvent('fetch-connect', { detail: { progress: 35 } })
    )

    let response = await fetch(url, options)
    if (response.status === 420) return '420: Enhance Your Calm'
    if (![200, 201, 202, 400].includes(response.status))
      return response.status + ': ' + response.statusText

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
      if (done) break
      chunks.push(value)
      receivedLength += value.length
      ratio = (contentLength / receivedLength) * 100
      window.dispatchEvent(
        new CustomEvent('fetch-read', { detail: { progress: ratio / 2 + 50 } })
      )
    }

    let chunksAll = new Uint8Array(receivedLength)
    let position = 0
    for (let chunk of chunks) {
      chunksAll.set(chunk, position)
      position += chunk.length
    }

    let result = new TextDecoder('utf-8').decode(chunksAll)
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
    ).value = `${location.protocol}//${location.host}/${url}`
  }

  function getUrl () {
    if (customUrl) return document.getElementById('url').value

    const id = modelIdInput.value
    const model = document.getElementById('model').value
    const param = document.getElementById('parameter').value
    const query = document.getElementById('query').value
    const port = document.getElementById('port').value

    let url = `${modelApiPath}/${model}`
    if (id) url += `/${id}`
    if (param) url += `/${param}`
    if (port) url += `/service/ports/${port}`
    if (query) url += `?${query}`

    displayUrl(url)
    return url
  }

  let customUrl = false

  function makeCustomUrl () {
    customUrl = true
  }

  function makeAutoUrl () {
    customUrl = false
  }

  const urlInput = document.getElementById('url')

  urlInput.onfocus = makeCustomUrl
  modelInput.onfocus = makeAutoUrl
  modelIdInput.onfocus = makeAutoUrl
  queryInput.onfocus = makeAutoUrl
  paramInput.onfocus = makeAutoUrl
  portInput.onfocus = makeAutoUrl

  modelInput.onchange = updatePorts
  modelIdInput.onchange = getUrl
  queryInput.onchange = getUrl
  paramInput.onchange = getUrl
  portInput.onchange = getUrl

  function removeAllChildNodes (parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  }

  function updatePorts () {
    portInput.value = ''
    removeAllChildNodes(document.querySelector('#portList'))
    getUrl()

    const model = models.find(model => model.endpoint === modelInput.value)

    Object.keys(model.ports).forEach(port => {
      if (model.ports[port].type === 'inbound')
        portList.appendChild(new Option(port))
    })
  }

  function showMessage (message) {
    document.getElementById('jsonCode').innerHTML += `\n${prettifyJson(
      message
    )}`
    messages.scrollTop = messages.scrollHeight
  }

  function updateModelId (id) {
    if (id) modelIdInput.value = id
  }

  async function handleResponse (response) {
    try {
      const json = await response.json()
      const msg = JSON.stringify(json, null, 2)
      if (json?.modelId) updateModelId(json.modelId)
      if (response.status === 420) return '420: enhance your calm'
      if ([200, 201, 202, 400].includes(response.status)) return msg
      return new Error([response.status, response.statusText, msg].join(': '))
    } catch (error) {
      return error.message
    }
  }

  function modelNameFromEndpoint () {
    const endpoint = document.getElementById('model').value
    return models.find(model => model.endpoint === endpoint).modelName
  }

  const fetchEvents = ['fetch-connect', 'fetch-read', 'fetch-done']

  window.addEventListener('fetch-connect', function (e) {
    reloadModelButton.disabled = true
    reloadModelButton.ariaBusy = true
  })

  window.addEventListener('fetch-done', function (e) {
    reloadModelButton.disabled = false
    reloadModelButton.ariaBusy = false
  })

  reloadModelButton.onclick = async function () {
    const bar = new ProgressBar(fetchEvents)
    bar.show()
    const modelName = modelNameFromEndpoint()
    const response = await instrumentedFetch(
      `${modelApiPath}/reload?modelName=${modelName}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    )
    showMessage(response)
    setTimeout(() => bar.hide(), 1000)
  }

  /**
   * Increase or decreae value to adjust how long
   * one should keep pressing down before the pressHold
   * event fires
   *
   * @param {*} item
   * @param {*} action
   * @param {*} pressHoldDuration
   */
  function pressAndHold (item, action, pressHoldDuration = 20) {
    let timerID
    let counter = 0

    let pressHoldEvent = new CustomEvent('pressHold')

    // Listening for the mouse and touch events
    item.addEventListener('mousedown', pressingDown, false)
    item.addEventListener('mouseup', notPressingDown, false)
    item.addEventListener('mouseleave', notPressingDown, false)
    item.addEventListener('touchstart', pressingDown, false)
    item.addEventListener('touchend', notPressingDown, false)
    // Listening for our custom pressHold event
    item.addEventListener('pressHold', action, false)

    function pressingDown (e) {
      // Start the timer
      requestAnimationFrame(timer)
      e.preventDefault()
      console.log('Pressing!')
    }

    function notPressingDown (e) {
      // Stop the timer
      cancelAnimationFrame(timerID)
      counter = 0
      console.log('Not pressing!')
    }

    function timer () {
      console.log('Timer tick!')

      if (counter < pressHoldDuration) {
        timerID = requestAnimationFrame(timer)
        counter++
      } else {
        console.log('Press threshold reached!')
        item.dispatchEvent(pressHoldEvent)
      }
    }
  }

  pressAndHold(postButton, () => (modelIdInput.value = ''))

  postButton.onclick = async function post () {
    const model = document.getElementById('model').value
    if (!model || model === '') {
      showMessage({ error: 'no model selected' })
      return
    }
    const bar = new ProgressBar(fetchEvents)
    const timerId = setTimeout(() => bar.show(), 1000)
    try {
      const response = await instrumentedFetch(getUrl(), {
        method: 'POST',
        body: document.getElementById('payload').value,
        headers: getHeaders()
      })
      clearTimeout(timerId)
      setTimeout(() => bar.hide(), 1000)
      updateModelId(response.modelId)
      showMessage(response)
    } catch (error) {
      showMessage(error.message)
    }
  }

  patchButton.onclick = function () {
    queryInput.value = ''
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
    if (/html=true/i.test(queryInput.value)) {
      window.open(getUrl())
      return
    }
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
    modelInput.value = ''
    modelIdInput.value = ''
    queryInput.value = ''
    paramInput.value = ''
    portInput.value = ''
    getUrl()
  })

  clearIdButton.addEventListener('click', function () {
    modelIdInput.value = ''
    paramInput.value = ''
    getUrl()
  })

  clearParamButton.addEventListener('click', function () {
    paramInput.value = ''
    getUrl()
  })

  clearQueryButton.addEventListener('click', function () {
    queryInput.value = ''
    getUrl()
  })

  clearPortsButton.addEventListener('click', function () {
    portInput.value = ''
    getUrl()
  })

  window.addEventListener('load', async function () {
    // if enabled, request fresh access token and store in auth header
    await refreshAccessToken()
    // get list of all models and add to datalist for model input control
    const modelJson = await fetch('aegis/api/config?isCached=false', {
      headers: getHeaders()
    })
    models = await modelJson.json()
    models.forEach(m => {
      modelList.appendChild(new Option(m.endpoint))
    })
  })
})()
