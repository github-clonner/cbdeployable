var Ansible = require('node-ansible'); // how to use http://shaharke.github.io/node-ansible/

module.exports = function(emitter) {
    var module = {};

    module.deploy = function(options) {
        /********************************************/
        emitter.emit('deploy-success', options);
        return;
        // until we get some ansible up in here!
        /********************************************/

        if (typeof options != 'object' || typeof options.playbook != 'string' || typeof options.vars != 'object')
            emitter.emit('error', 'double check the \'options\' object, and that you have \'path\' and \'secret\' options');


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