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

    const response = await fetch(url, options)
    await handleError(response)

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
  let useIdempotencyKey = false

  function generateUUID () {
    // Public Domain/MIT
    var d = new Date().getTime() //Timestamp
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0 //Time in microseconds since page-load or 0 if unsupported
    return 'yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 //random number between 0 and 16
      if (d > 0) {
        //Use timestamp until depleted
        r = (d + r) % 16 | 0
        d = Math.floor(d / 16)
      } else {
        //Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0
        d2 = Math.floor(d2 / 16)
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  /**
   * Returns headers, including auth header if auth is enabled.
   * @returns {{
   * "Content-Type":"application/json",
   * "Authorization": "bearer <token>"
   * }}
   */
  function getHeaders () {
    const content = { 'Content-Type': 'application/json' }
    const headers = {
      ...content,
      ...authHeader
    }
    return useIdempotencyKey
      ? { ...headers, 'idempotency-key': generateUUID() }
      : headers
  }

  async function refreshAccessTocken (conf) {
    const token = conf.services.token
    let jwtToken = { access_token: '' }
    if (token.authEnabled) {
      const data = await fetch(token.oauthUri, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          client_id: token.client_id,
          client_secret: token.client_secret,
          audience: token.audience,
          grant_type: token.grant_type
        })
      })
      jwtToken = await data.json()
      // add json web token to authentication header
      authHeader = { Authorization: `bearer ${jwtToken.access_token}` }
    }
  }

  function setIdempotency (conf) {
    useIdempotencyKey = conf.general.useIdempotencyKey
  }

  /**
   * Get config file. If auth is enabled, request new
   * JSON Web Token and set `authHeader` accordingly.
   * Need CORS for this.
   */
  async function updateConfigSettings () {
    const file = await fetch('aegis.config.json')
    const text = await file.text()
    const conf = JSON.parse(text)
    refreshAccessTocken(conf)
    setIdempotency(conf)
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

  function makeCustUrl () {
    customUrl = true
  }

  function makeAutoUrl () {
    customUrl = false
  }

  const urlInput = document.getElementById('url')

  urlInput.onfocus = makeCustUrl
  modelInput.onfocus = makeAutoUrl
  modelIdInput.onfocus = makeAutoUrl
  queryInput.onfocus = makeAutoUrl
  paramInput.onfocus = makeAutoUrl
  portInput.onfocus = makeAutoUrl

  modelInput.onchange = getUrl
  modelIdInput.onchange = getUrl
  queryInput.onchange = getUrl
  paramInput.onchange = getUrl
  portInput.onchange = getUrl

  modelInput.addEventListener('change', updatePorts)
  modelInput.addEventListener('change', updateQueryList)
  modelIdInput.addEventListener('change', updateQueryList)

  function removeAllChildNodes (parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  }

  function updatePorts () {
    const endpoint = modelInput.value.toUpperCase()

    portInput.value = ''
    removeAllChildNodes(document.querySelector('#portList'))

    const model = models.find(
      model => model.endpoint.toUpperCase() === endpoint
    )

    if (model?.ports)
      Object.keys(model.ports).forEach(port => {
        if (model.ports[port].type === 'inbound')
          portList.appendChild(new Option(port))
      })

    getUrl()
  }

  function updateQueryList () {
    const endpoint = modelInput.value.toUpperCase()

    queryInput.value = ''
    removeAllChildNodes(document.querySelector('#queryList'))

    if (modelIdInput.value === '') {
      queryList.appendChild(new Option('__count=all'))
      queryList.appendChild(new Option('__cached=true'))
      return
    }

    const model = models.find(
      model => model.endpoint.toUpperCase() === endpoint
    )

    if (model?.relations) {
      Object.keys(model.relations).forEach(rel => {
        queryList.appendChild(new Option(`relation=${rel}`))
      })
    }
    if (model?.commands) {
      Object.keys(model.commands).forEach(cmd => {
        queryList.appendChild(new Option(`command=${cmd}`))
      })
    }
    queryList.appendChild(new Option('html=true'))
    queryList.appendChild(new Option('__cached=true'))

    getUrl()
  }

  let modelId

  function setModelId (id) {
    modelId = id
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

  function showMessage (message, style = 'pretty') {
    const styles = {
      pretty: message => `\n${prettifyJson(message)}`,
      error: message =>
        `\n<span style="color:#FF7F50"><b>${message}</b></span>`,
      plain: message => `\n${message}`
    }
    //const msg = message === typeof Object ? JSON.stringify(message) : message
    document.getElementById('jsonCode').innerHTML += styles[style](message)
    messages.scrollTop = messages.scrollHeight
  }

  async function handleError (response) {
    let msg = null
    if (response.status > 199 && response.status < 300) {
      return response
    }
    try {
      msg = JSON.stringify(await response.json(), null, 2)
    } catch (error) {
      msg = `${response.status}: ${response.statusText}`
    }
    throw new Error(msg)
  }

  async function handleResponse (response) {
    return response.json()
  }

  let endpoints = []

  window.addEventListener('change', () => (endpoints = []))

  function prettifyJson (json) {
    let endpoint = modelInput.value
    if (!json) return
    if (typeof json !== 'string') {
      jsonArr = [json].flat()
      json = JSON.stringify(json, null, 2)
    } else {
      jsonArr = [JSON.parse(json)].flat()
    }
    let nextId = false
    let nextEndpoint = false
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        if (nextEndpoint) {
          nextEndpoint = false
          endpoints.push(match.replaceAll('"', ''))
        }
        if (nextId) {
          nextId = false
          console.log(location.search)
          const id = match.replaceAll('"', '')
          const ep = jsonArr.filter(x => x.id === id).map(x => x.endpoint)[0]
          endpoint = ep || endpoint
          return `<button type="button" onclick="window.dispatchEvent(new CustomEvent(\'getId\', {detail:{ id:\'${id}\',
          endpoint: \'${endpoint}\'}}))" class="btn-warning" title="Click to GET ID">GET ${match}</button>`
        }
        let cls = '<span>'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            if (/"id"|"modelId"/.test(match)) {
              nextId = true
            }
            if (/"endpoint"/.test(match)) {
              nextEndpoint = true
            }
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

  window.addEventListener('getId', e => {
    modelInput.value = endpoints.pop() || e.detail.endpoint
    modelIdInput.value = e.detail.id
    getButton.click()
  })

  reloadModelButton.onclick = async function () {
    try {
      const bar = new ProgressBar(fetchEvents)
      bar.show()
      const modelName = modelNameFromEndpoint()
      const jsonObj = await instrumentedFetch(
        `${modelApiPath}/reload?modelName=${modelName}`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      )
      showMessage(jsonObj)
      setTimeout(() => bar.hide(), 1000)
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  pressAndHold(postButton, () => (modelIdInput.value = ''))

  postButton.onclick = async function post () {
    try {
      const jsonObj = await instrumentedFetch(getUrl(), {
        method: 'POST',
        body: document.getElementById('payload').value,
        headers: getHeaders()
      })
      setModelId(jsonObj.id)
      showMessage(jsonObj)
    } catch (err) {
      showMessage(err.message, 'error')
    }
  }

  patchButton.onclick = function () {
    queryInput.value = ''
    fetch(getUrl(), {
      method: 'PATCH',
      body: document.getElementById('payload').value,
      headers: getHeaders()
    })
      .then(handleError)
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message, 'error')
      })
  }

  getButton.onclick = function () {
    if (/html=true/i.test(queryInput.value)) {
      window.open(getUrl())
      return
    }
    document.getElementById('parameter').value = ''
    fetch(getUrl(), { headers: getHeaders() })
      .then(handleError)
      .then(handleResponse)
      .then(showMessage)
      .then(updateQueryList)
      .catch(function (err) {
        showMessage(err.message, 'error')
      })
  }

  deleteButton.onclick = function () {
    fetch(getUrl(), { method: 'DELETE', headers: getHeaders() })
      .then(handleError)
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message, 'error')
      })
  }

  clearButton.onclick = function () {
    document.getElementById('jsonCode').innerHTML = ''
  }

  copyButton.addEventListener('click', function () {
    modelIdInput.select()
    navigator.clipboard.writeText(modelIdInput.value)
  })

  clearModelButton.addEventListener('click', function () {
    setModelId(null)
    modelInput.value = ''
    modelIdInput.value = ''
    queryInput.value = ''
    paramInput.value = ''
    portInput.value = ''
    updatePorts()
    updateQueryList()
    getUrl()
  })

  clearIdButton.addEventListener('click', function () {
    modelIdInput.value = ''
    paramInput.value = ''
    updateQueryList()
    updatePorts()
    getUrl()
  })

  clearParamButton.addEventListener('click', function () {
    paramInput.value = ''
    getUrl()
  })

  clearQueryButton.addEventListener('click', function () {
    queryInput.value = ''
    updateQueryList()
    getUrl()
  })

  clearPortsButton.addEventListener('click', function () {
    portInput.value = ''
    updatePorts()
    getUrl()
  })

  window.addEventListener('load', async function () {
    // if enabled, request fresh access token and store in auth header
    await updateConfigSettings()
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
