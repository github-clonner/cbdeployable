var crypto = require('crypto'),
    bl = require('bl'),
    bufferEq = require('buffer-equal-constant-time');

module.exports = {
    initialize: function(emitter, options) {
        "use strict";

        this.emitter = emitter;
        this.options = options;
        this.events = null;

        if (typeof this.options != 'object')
            this.emitter.emit('error', 'must provide an options object');

        if (typeof this.options.path != 'string')
            this.emitter.emit('error', 'must provide a \'path\' option');

        if (typeof this.options.secret != 'string')
            this.emitter.emit('error', 'must provide a \'secret\' option');

        if (typeof this.options.events == 'string' && this.options.events != '*')
            this.events = [ options.events ];

        else if (Array.isArray(this.options.events) && this.options.events.indexOf('*') == -1)
            this.events = this.options.events;
    },
    handler: function(req, res, callback) {
        "use strict";

        if (req.url.split('?').shift() !== this.options.path)
            return callback();

        function hasError (req, msg) {
            res.writeHead(400, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: msg }));

            var err = new Error(msg);

            this.emitter.emit('error', err, req);
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

        if (this.events && this.events.indexOf(event) == -1)
            return hasError('X-Github-Event is not acceptable');

        req.pipe(bl(function (err, data) {
            if (err) {
                return hasError(err.message)
            }

            var obj;
            var computedSig = new Buffer(this.signBlob(this.options.secret, data));

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
                event   : event
                , id      : id
                , payload : obj
                , protocol: req.protocol
                , host    : req.headers['host']
                , url     : req.url
            }

            this.emitter.emit(event, emitData);
            //this.emitter.emit('*', emitData);
        }));
    },
    signBlob: function(key, blob) {
        "use strict";

        return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex');
    }
}