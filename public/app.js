
(function () {
  const messages = document.querySelector('#messages');
  const postButton = document.querySelector('#post');
  const patchButton = document.querySelector('#patch');
  const getButton = document.querySelector('#get');
  const clearButton = document.querySelector('#clear');

  function showMessage(message) {
    messages.textContent += `\n${message}`;
    messages.scrollTop = messages.scrollHeight;
  }

  function handleResponse(response) {
    return response.ok
      ? response.json().then((data) => JSON.stringify(data, null, 2))
      : Promise.reject(new Error('Unexpected response'));
  }

  postButton.onclick = function () {
    fetch('/api/' + document.getElementById('model').value, {
      method: "POST",
      body: document.getElementById('body').innerHTML,
      headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  }

  patchButton.onclick = function () {
    fetch('/api/' + document.getElementById('model').value, {
      method: "PATCH",
      body: document.getElementById('body').innerHTML,
      headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  }

  getButton.onclick = function () {
    fetch('/api/' + document.getElementById('model').value)
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  }

  clearButton.onclick = function () {
    messages.textContent = '';
  }


})();