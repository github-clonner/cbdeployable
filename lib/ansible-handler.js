module.exports = {
    initialize: function(options) {
        "use strict";

        var Ansible = require('node-ansible'),
            Emitter = require('tiny-emitter'),
            emitter = new Emitter(); // how to use http://shaharke.github.io/node-ansible/
    },
    deploy: function(options) {
        "use strict";

        this.emitter.emit('success', options);

        this.emitter.emit('error', 'massive failure!');
    }



    // if (typeof options != 'object')
    //     throw new TypeError('must provide an options object');
    //
    // if (typeof options.playbook != 'string')
    //     throw new TypeError('must provide a \'playbook\' option');
    //
    // if (typeof options.vars != 'object')
    //     throw new TypeError('must provide a \'vars\' option');
    //
    // var command = new Ansible.Playbook()
    //     .playbook(options.playbook)
    //     .variables(options.vars),
    //     promise = command.exec();
    //
    // promise.then(function(result) {
    //     deployer.emit('success', result.code);
    // }, function(err) {
    //     deployer.emit(err);
    // });
}