var crypto = require('crypto'),
    bl = require('bl'),
    bufferEq = require('buffer-equal-constant-time');

module.exports = function(emitter) {
    "use strict";

    var module = {};

    module.handler = function(req, res, options, callback) {

        var events = setEvents(options);

        if (req.url.split('?').shift() !== options.path)
            return callback();

        function hasError (req, msg) {
            res.writeHead(400, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: msg }));

            var err = new Error(msg);

            emitter.emit('error', err, req);
            callback(err);
        }

        var sig = req.headers['x-hub-signature'],
            event = req.headers['x-github-event'],
            id = req.headers['x-github-delivery'];

        if (!sig)
            return hasError('No X-Hub-Signature found on request');

        if (!event)
            return hasError('No X-Github-Event found on request');

        if (!id)
            return hasError('No X-Github-Delivery found on request');

        if (events && events.indexOf(event) == -1)
            return hasError('X-Github-Event is not acceptable');

        req.pipe(bl(function (err, data) {
            if (err) {
                return hasError(err.message)
            }

            var obj;
            var computedSig = new Buffer(signBlob(options.secret, data));

            if (!bufferEq(new Buffer(sig), computedSig))
                return hasError('X-Hub-Signature does not match blob signature');

            try {
                obj = JSON.parse(data.toString())
            } catch (e) {
                return hasError(e)
            }

            res.writeHead(200, { 'content-type': 'application/json' });
            res.end('{"ok":true}');

            var emitData = {
                event : event,
                id : id,
                payload : obj,
                protocol : req.protocol,
                host : req.headers['host'],
                url : req.url
            }

            emitter.emit(event, emitData);
            //emitter.emit('*', emitData);
        }));
    };

    function setEvents(options) {
        var events = null;

        if (typeof options != 'object')
            emitter.emit('error', 'must provide an options object');

        if (typeof options.path != 'string')
            emitter.emit('error', 'must provide a \'path\' option');

        if (typeof options.secret != 'string')
            emitter.emit('error', 'must provide a \'secret\' option');

        if (typeof options.events == 'string' && options.events != '*')
            events = [ options.events ];

        else if (Array.isArray(options.events) && options.events.indexOf('*') == -1)
            events = options.events;

        return events;
    }

    function signBlob(key, blob) {
        return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex');
    };

    return module;
}