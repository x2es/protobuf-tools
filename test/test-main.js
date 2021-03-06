
/**
 * This is entry-point for testing with karma-runner and requirejs
 * based on sinpped from: http://karma-runner.github.io/0.8/plus/RequireJS.html
 */
(function() {

  var specFiles = null;
  var baseUrl = '';
  var requirejsCallback = null;

  // if invoked in karma-runner environment
  if (typeof window != 'undefined' && window.__karma__ != undefined) {
    // Karma serves files from '/base'
    baseUrl = '/base';
    requirejsCallback = window.__karma__.start;

    // looking for *_spec.js files
    specFiles = [];
    for (var file in window.__karma__.files) {
      if (window.__karma__.files.hasOwnProperty(file)) {
        if (/.*\/js\/spec\/.+_spec\.js$/.test(file)) {
          specFiles.push(file);
        }
      }
    }
  }

  requirejs.config({
      baseUrl: baseUrl,

      paths: {
        'chai': 'node_modules/chai/chai',

        'lodash': 'node_modules/lodash/lodash',

        'ProtoBuf': 'node_modules/protobufjs/ProtoBuf',
        'ByteBuffer': 'node_modules/protobufjs/node_modules/bytebuffer/ByteBuffer',
        'Math/Long': 'node_modules/protobufjs/node_modules/bytebuffer/node_modules/long/Long',

        'protobuf-wrapper':       'js/lib/protobuf-wrapper',
        'protobuf-wrapper.priv':  'js/lib/protobuf-wrapper.priv',
        'message-decoder':        'js/lib/message-decoder',
        'fixtures-factory':       'js/lib/fixtures-factory'
      },

      // ask Require.js to load these files (all our tests)
      deps: specFiles,

      // start test run, once Require.js is done
      callback: requirejsCallback
  });
})();

