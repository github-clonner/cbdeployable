var http = require('http'),
	Emitter = require('tiny-emitter'),
	emitter = new Emitter(),
	webhook = require('./lib/webhook')(emitter),
	ansibleHandler = require('./lib/ansible-handler')(emitter),
	clone = require('./lib/clone')(emitter),
	port = process.env.PORT || 8080,
	hookOpts = {
		path: '/webhook',
		secret: 'myhashsecret'
	};

http.createServer(function (req, res) {

	webhook.handler(req, res, hookOpts, function (err) {
			res.statusCode = 404;
			res.end('no such location');
		});

}).listen(port);


emitter.on('push', function (event) {

	var repoUrl = event.payload.repository.url,
		eventBranch = event.payload.ref,
		branch = eventBranch.substring(eventBranch.lastIndexOf('/') + 1);

	console.log('Received a push event for %s to %s', repoUrl, branch);

	clone.clone();

	// ansibleHandler.deploy({
	// 	playbook: 'temp',
	// 	vars: {
	// 		env: 'dev'
	// 	}
	// });

});

emitter.on('cloned', function (path) {
	console.error('Cloned Dir: ', path);
});

emitter.on('deploy-success', function (msg) {
	console.error('Success: ', msg);
});


emitter.on('error', function (err) {
	console.error('Error: %s', err);
});