;(function () {
  const messages = document.querySelector('#messages')
  const wsButton = document.querySelector('#wsButton')
  const statusButton = document.querySelector('#status')
  const clearButton = document.querySelector('#clear')

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
          cls = "<span class='text-white'>"
        } else if (/null/.test(match)) {
          cls = "<span class='text-info'>"
        }
        return cls + match + '</span>'
      }
    )
  }

  function showMessage (message) {
    document.getElementById('jsonCode').innerHTML += `\n${prettifyJson(
      message
    )}`
    messages.scrollTop = messages.scrollHeight
  }

  let ws

  wsButton.onclick = function () {
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null
      ws.close()
    }

    const proto = /https/i.test(location.protocol) ? 'wss' : 'ws'
    ws = new WebSocket(`${proto}://${location.hostname}:${location.port}`, [
      'webswitch'
    ])
    ws.onerror = function (e) {
      showMessage('WebSocket error', e)
    }

    ws.onopen = function () {
      showMessage('WebSocket connection established')
      ws.send(JSON.stringify({ proto: 'webswitch', pid: 1, role: 'browser' }))
    }

    ws.onclose = function () {
      showMessage('WebSocket connection closed')
      ws = null
    }

    ws.onmessage = function (event) {
      try {
        if (event.data instanceof Blob) {
          reader = new FileReader()
          reader.onload = () => {
            console.log('Result: ' + reader.result)
            reader.readAsText(event.data)
            showMessage(JSON.stringify(JSON.parse(reader.result), undefined, 2))
          }
        } else {
          showMessage(JSON.stringify(JSON.parse(event.data), undefined, 2))
        }
      } catch (err) {
        console.error('onmessage', event, err.message)
      }
    }
    setTimeout(
      () => ws.send(JSON.stringify({ proto: 'webswitch', pid: 'browser' })),
      1000
    )
  }

  statusButton.onclick = function () {
    console.log('sending status')
    ws.send(JSON.stringify('status'))
  }

  clearButton.onclick = function () {
    document.getElementById('jsonCode').innerHTML = ''
  }
})()
