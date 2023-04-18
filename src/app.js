module.exports = (sock) => {
	const express = require('express');
	const app = express();
	const mongoConnect = require('./db/mongoConnect');
	const bodyParser = require('body-parser')
	const { User } = require('./models/user');
	const { Group } = require('./models/group');
	mongoConnect();
	


	//Settings
	app.set('port', process.env.port || 3000);
	//app.use(formidable());
	app.use(bodyParser.json());

	app.get('/users', async (req, res) => {
		users = await User.find();
		res.send(users);
	});

	app.get('/groups', async (req, res) => {
		users = await Group.find();
		res.send(users);
	});

	app.get('/groups/:jid', async (req, res) => {
		console.log(req.params);
		const metadata = await sock.groupMetadata(req.params.jid);
		res.send(metadata);
	});

	app.post('/messages', async (req, res) => {
		await sock.sendMessage(req.body.jid, req.body.msg, req.body.opts);
		res.send('ok');
	});





	app.listen(app.get('port'), () => {
		console.log('Server on port', app.get('port'));
	})




}