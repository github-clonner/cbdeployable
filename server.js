var http = require('http'),
	webhookHandler = require('./lib/webhook-handler'),
	ansibleHandler = require('./lib/ansible-handler'),
	Emitter = require('tiny-emitter'),
	emitter = new Emitter(),
	port = process.env.PORT || 8080,
	hookRouter = {
		path: '/webhook',
		secret: 'myhashsecret'
	};

http.createServer(function (req, res) {
	webhookHandler.initialize(emitter, hookRouter, function(o) {
		o.handler(req, res, function (err) {
			res.statusCode = 404;
			res.end('no such location');
		});
	});
}).listen(port);


emitter.on('push', function (event) {
	console.log('Received a push event for %s to %s', event.payload.repository.name, event.payload.ref);

	ansibleHandler.initialize(emitter, function(o) {
		o.deploy({
			playbook: 'temp',
			vars: {
				env: 'dev'
			}
		});
	});
});


emitter.on('deploy-success', function (msg) {
	console.error('Success: ', msg);
});


emitter.on('error', function (err) {
	console.error('Error: %s', err);
});