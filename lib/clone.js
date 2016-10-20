var tmp = require('tmp');

module.exports = function(emitter) {
    "use strict";

    var module = {};

    module.clone = function(options) {

        createTmpDir();

    };

    function createTmpDir() {

        tmp.dir({ unsafeCleanup: true }, function _tempDirCreated(err, path, cleanupCallback) {
            if (err) throw err;
            console.log("Dir: ", path);
            emitter.emit('cloned', path);

            cleanupCallback();
        });
    }

    return module;
}