process.stdin.pipe(require('split')()).on('data', processLine)

function processLine (line) {
  console.log(line + '!')
}
