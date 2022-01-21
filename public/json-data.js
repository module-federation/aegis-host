const json2html = require('node-json2html')

let data = {
  employees: [
    { name: 'dorian' },
    { name: 'monica' },
    { name: 'jill' },
    { name: 'ashley' }
  ]
}

let template = {
  '<>': 'ul',
  html: [
    {
      '<>': 'li',
      obj: function () {
        return this.employees
      },
      html: [{ '<>': 'span', text: '${name}' }]
    }
  ]
}

//render and output
console.log(json2html.render(data, template))
