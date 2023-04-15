module.exports = (sock) => {


	const express = require('express');
	const app = express();
	const port = 3003;
	
	app.get('/', (req, res) => {
		let fakemsg = {
			key: {
				id: '',
				//remoteJid: '120363039926320392@g.us', //cripto
				//remoteJid: '5491134475885-1471302806@g.us', //vidas
				participant: '120363066454866283@g.us', //sudoers
				remoteJid: '5491163534537@s.whatsapp.net',
				participant: undefined, //'5491169940853@s.whatsapp.net',
				},
			message: { conversation: 'que haces lucho?' }
		}
		/*let fakemsg = { 
			'key': { 
				'id': '' ,
				'participants': '0@s.whatsapp.net', 
				'remoteJid': 'status@broadcast', 
				'fromMe': false, 
			}, 
			'message': { 
				'contactMessage': { 
					'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=5491169940853:5491169940853\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
				},
			}, 
			'participant': '0@s.whatsapp.net', 
		};*/
	
		sock.sendMessage('120363066454866283@g.us', { text: 'todo bien amigo, vos?' } , { quoted: fakemsg });
		res.send('Hello World!');

	});
	
	app.post('/', (req, res) => {

	});
	
	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`)
	});
	
}