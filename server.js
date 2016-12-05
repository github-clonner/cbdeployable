var http = require('http'),
	Emitter = require('tiny-emitter'),
	emitter = new Emitter(),
	webhook = require('./lib/webhook')(emitter),
	ansibleHandler = require('./lib/ansible-handler')(emitter),
	clone = require('./lib/clone')(emitter),
	port = process.env.PORT || 8999,
	hookOpts = {
		path: '/webhook',
		secret: 'CBD3pl0y3RRulz!'
	};

http.createServer((req, res) => {
	webhook.handler(req, res, hookOpts, err => {
		res.statusCode = 404;
		res.end('no such location');
	});
}).listen(port);


emitter.on('push', event => {
	let repoUrl = event.payload.repository.url,
		eventBranch = event.payload.ref,
		branch = eventBranch.substring(eventBranch.lastIndexOf('/') + 1);

	console.log('Received a push event for %s to %s', repoUrl, branch);
	clone.clone(repoUrl, branch);

	// ansibleHandler.deploy({
	// 	playbook: 'temp',
	// 	vars: {
	// 		env: 'dev'
	// 	}
	// });
});

emitter.on('cloned', path => console.error('Cloned Dir: ', path));
emitter.on('deploy-success', msg => console.error('Success: ', msg));
emitter.on('error', err => console.error('Error: %s', err));