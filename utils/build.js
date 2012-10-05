
var params = {
  "baseUrl": "../src/",
  "main": "Physics",
  "out": "../build/Physics.js",
  "minify": false,
  "shortcut": "Physics",
  "paths": {}
}

require('./builder.js').build(params);

// Currently broken.

// params.minify = true;
// params.out = '../build/Physics.min.js';

// require('./builder.js').build(params);