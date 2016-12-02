var crypto = require('crypto'),
    bl = require('bl'),
    bufferEq = require('buffer-equal-constant-time');

module.exports = function(emitter) {
    var module = {},
        _setEvents = options => {
            if (typeof options != 'object' || typeof options.path != 'string' || typeof options.secret != 'string')
                emitter.emit('error', 'double check the \'options\' object, and that you have \'path\' and \'secret\' options');

            return (typeof options.events == 'string' && options.events != '*') ? [ options.events ] :
                (Array.isArray(options.events) && options.events.indexOf('*') == -1) ? options.events : null;
        },
        _signBlob = (key, blob) => {
            return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex');
        };

    module.handler = function(req, res, options, callback) {
        if (req.url.split('?').shift() !== options.path)
            return callback();

        var events = _setEvents(options),
                _hasError = (req, msg) => {
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: msg }));

                let err = new Error(msg);

                emitter.emit('error', err, req);
                callback(err);
            },
            sig = req.headers['x-hub-signature'] || (() => { return _hasError('No X-Hub-Signature found on request') })(),
            event = req.headers['x-github-event'] || (() => { return _hasError('No X-Github-Event found on request') })(),
            id = req.headers['x-github-delivery'] || (() => { return _hasError('No X-Github-Delivery found on request') })();

        if (events && events.indexOf(event) == -1)
            return _hasError('X-Github-Event is not acceptable');

        req.pipe(bl((err, data) => {
            if (err) {
                return _hasError(err.message)
            }

            var obj,
                computedSig = new Buffer(_signBlob(options.secret, data));

            if (!bufferEq(new Buffer(sig), computedSig))
                return _hasError('X-Hub-Signature does not match blob signature');

            try {
                obj = JSON.parse(data.toString())
            } catch (e) {
                return _hasError(e)
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

    return module;
}