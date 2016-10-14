var http = require('http'),
	webhookHandler = require('./lib/webhook-handler'),
	ansibleHandler = require('./lib/ansible-handler'),
	Emitter = require('tiny-emitter'),
	emitter = new Emitter(),
	port = process.env.PORT || 8080;

http.createServer(function (req, res) {

	webhookHandler.initialize(emitter, {
		path: '/webhook',
		secret: 'myhashsecret'
	});

	webhookHandler.handler(req, res, function (err) {
		res.statusCode = 404;
		res.end('no such location');
	})

}).listen(port);

emitter.on('error', function (err) {
	if(typeof err === 'object') {
		console.error('Error:', err.message);
	} else {
		console.error('Error:', err);
	}
});

emitter.on('deploy-success', function (msg) {
	console.error('Success:', msg);
});

emitter.on('push', function (event) {
	console.log('Received a push event for %s to %s',
		event.payload.repository.name,
		event.payload.ref);

	ansibleHandler.initialize(emitter);

	var deploy = ansibleHandler.deploy({
		playbook: 'temp',
		vars: {
			env: 'dev'
		}
	});
});