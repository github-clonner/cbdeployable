var Ansible = require('node-ansible'); // how to use http://shaharke.github.io/node-ansible/

module.exports.deploy = function(options) {
    "use strict";

    if (typeof options != 'object')
        throw new TypeError('must provide an options object');

    if (typeof options.playbook != 'string')
        throw new TypeError('must provide a \'playbook\' option');

    if (typeof options.vars != 'object')
        throw new TypeError('must provide a \'vars\' option');


    console.log('success', options);

    return true;



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