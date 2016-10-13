var http = require('http'),
	createHandler = require('./lib/webhook-handler'),
	handler = createHandler({ path: '/webhook', secret: 'myhashsecret' }),
	deployHandler = require('./lib/ansible-handler'),
	Emitter = require('tiny-emitter'),
	emitter = new Emitter(),
	port = process.env.PORT || 8080;

http.createServer(function (req, res) {
	handler(req, res, function (err) {
		res.statusCode = 404;
		res.end('no such location');
	})
}).listen(port);

handler.on('error', function (err) {
	console.error('Error:', err.message);
});

emitter.on('error', function (err) {
	console.error('Error:', err);
});

emitter.on('success', function (msg) {
	console.error('Success:', msg);
});

handler.on('push', function (event) {
	console.log('Received a push event for %s to %s',
		event.payload.repository.name,
		event.payload.ref);

	var deploy = deployHandler.deploy({
		playbook: 'temp',
		vars: {
			env: 'dev'
		}
	});
});