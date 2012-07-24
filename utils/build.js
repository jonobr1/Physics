
var params = {
  "baseUrl": "../src/",
  "main": "System",
  "out": "../build/physics.js",
  "minify": false,
  "shortcut": "physics.System",
  "paths": {},
  "namespaces": ["physics"]
}

require('./builder.js').build(params);

params.minify = true;
params.out = '../build/physics.min.js';

require('./builder.js').build(params);