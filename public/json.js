const json2htm = require('json2html')

let html = json2html.render([{'s':'json2html'},{'s':'is'},{'s':'awesome'}],{'<>':'li','text':'${s}'});


