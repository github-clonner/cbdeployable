var Ansible = require('node-ansible'); // how to use http://shaharke.github.io/node-ansible/

module.exports = function(emitter) {
    "use strict";

    var module = {};

    module.deploy = function(options) {
        emitter.emit('deploy-success', options);
        return; // until we get some ansible up in here!

        if (typeof options != 'object')
            emitter.emit('error', 'must provide an options object');

        if (typeof options.playbook != 'string')
            emitter.emit('error', 'must provide a \'playbook\' option');

        if (typeof options.vars != 'object')
            emitter.emit('error', 'must provide a \'vars\' option');

        var command = new Ansible.Playbook()
                .playbook(options.playbook)
                .variables(options.vars),
            promise = command.exec();

        promise.then(function(result) {
            emitter.emit('deploy-success', result.code);
        }, function(err) {
            emitter.emit('error', err);
        });
    };

    return module;
}