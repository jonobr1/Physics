
var params = {
  "baseUrl": "../src/",
  "main": "Physics",
  "out": "../build/Physics.js",
  "minify": false,
  "shortcut": "Physics",
  "paths": {}
}

require('./builder.js').build(params);

params.minify = true;
params.out = '../build/Physics.min.js';

require('./builder.js').build(params);