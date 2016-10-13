const Ansible = require('node-ansible'),
    EventEmitter = require('events').EventEmitter; // how to use http://shaharke.github.io/node-ansible/

function deploy(options) {
    "use strict";

    if (typeof options != 'object')
        throw new TypeError('must provide an options object');

    if (typeof options.playbook != 'string')
        throw new TypeError('must provide a \'playbook\' option');

    if (typeof options.vars != 'object')
        throw new TypeError('must provide a \'vars\' option');

    // make it an EventEmitter, sort of
    deployer.__proto__ = EventEmitter.prototype;
    EventEmitter.call(deployer);

    return deployer;

    function deployer () {

        console.log('success', options);

        deployer.emit('success', options);

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
}

module.exports = deploy;