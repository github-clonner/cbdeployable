// not using for now, as Ansible will be the tool that does the cloning
var tmp = require('tmp'),
    Git = require("nodegit");

module.exports = function(emitter) {
    var module = {},
        _cloneRepo = (repo, branch, path, callback) => {
            Git.Clone(repo, path)
                .then(function(repo) {
                    return repo.getBranchCommit(branch);
                })
                .then(function(commit) {
                    return commit.getEntry("LICENSE");
                })
                .then(function(entry) {
                    return entry.getBlob().then(function(blob) {
                        blob.entry = entry;
                        return blob;
                    });
                })
                .then(function(blob) {
                    console.log(blob.entry.path() + blob.entry.sha() + blob.rawsize() + "b");
                    console.log(Array(72).join("=") + "\n\n");
                    console.log(String(blob));
                })
                .then(callback)
                .catch(function(err) {
                    console.log(err);
                    callback();
                });
        };

    module.clone = function(repo, branch) {
        tmp.dir({ unsafeCleanup: true, dir: "./" }, function _tempDirCreated(err, path, cleanupCallback) {
            if (err) throw err;
            console.log("Dir: ", path);
            emitter.emit('cloned', path);

            _cloneRepo(repo, branch, path, cleanupCallback);
        });
    };

    return module;
}