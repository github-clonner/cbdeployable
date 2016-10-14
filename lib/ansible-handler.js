var Ansible = require('node-ansible'); // how to use http://shaharke.github.io/node-ansible/

module.exports = {
    initialize: function(emitter) {
        "use strict";

        this.emitter = emitter;
    },
    deploy: function(options) {
        "use strict";

        this.emitter.emit('success', options);
        return; // until we get some ansible

        if (typeof options != 'object')
            this.emitter.emit('error', 'must provide an options object');

        if (typeof options.playbook != 'string')
            this.emitter.emit('error', 'must provide a \'playbook\' option');

        if (typeof options.vars != 'object')
            this.emitter.emit('error', 'must provide a \'vars\' option');

        var command = new Ansible.Playbook()
            .playbook(options.playbook)
            .variables(options.vars),
            promise = command.exec();

        promise.then(function(result) {
            this.emitter.emit('deploy-success', result.code);
        }, function(err) {
            this.emitter.emit('error', err);
        });
    }
}