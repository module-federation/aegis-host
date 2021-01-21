var i = 0;
var MAX_RETRY = 3;

function retryHandler(...args) {
  if (args) {
    args.push({ timer: true });
  }
  console.log("calling func");
  thisFunction(...args);
  i++;
  if (i < MAX_RETRY) {
    setTimeout(retryHandler, 1000, ...args);
  }
}

function callRetryHandler(...args) {
  if (!args) {
    return;
  }
  const calledbytimeout = args.pop();
  if (typeof calledbytimeout === "object" && calledbytimeout.timer) {
    return;
  }
  setTimeout(retryHandler, 1000, ...args);
}

function thisFunction(...args) {
  console.log("thisFunction called", args);
  callRetryHandler(...args);
}

thisFunction("callback");
