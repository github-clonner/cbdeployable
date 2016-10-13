var http = require('http'),
	createHandler = require('./lib/webhook-handler'),
	handler = createHandler({ path: '/webhook', secret: 'myhashsecret' }),
	//doDeployment = require('./lib/ansible-handler'),
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

handler.on('push', function (event) {
	console.log('Received a push event for %s to %s',
		event.payload.repository.name,
		event.payload.ref);

	console.log(event.payload.toString());

	// deploy({
	// 	playbook: '',
	// 	vars: {
	// 		env: ''
	// 	}
	// })

});