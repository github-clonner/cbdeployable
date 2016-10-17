var Ansible = require('node-ansible'); // how to use http://shaharke.github.io/node-ansible/

module.exports = {
    initialize: function(emitter, callback) {
        "use strict";

        var self = this;

        self.emitter = emitter;

        return callback();
    },
    deploy: function(options) {
        "use strict";

        var self = this;

        self.emitter.emit('deploy-success', options);
        return; // until we get some ansible up in here!

        if (typeof options != 'object')
            self.emitter.emit('error', 'must provide an options object');

        if (typeof options.playbook != 'string')
            self.emitter.emit('error', 'must provide a \'playbook\' option');

        if (typeof options.vars != 'object')
            self.emitter.emit('error', 'must provide a \'vars\' option');

        var command = new Ansible.Playbook()
            .playbook(options.playbook)
            .variables(options.vars),
            promise = command.exec();

        promise.then(function(result) {
            self.emitter.emit('deploy-success', result.code);
        }, function(err) {
            self.emitter.emit('error', err);
        });
    }
}