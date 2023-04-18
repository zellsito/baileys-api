const handleMsg = async(msg, sock) => {
	const { User } = require('./models/user');
	const { Group } = require('./models/group');


	//Return for broadcast messages (estados, etc). Audios too.
  if (!msg.message 
		|| msg.key.fromMe
		|| msg.key.remoteJid == 'status@broadcast'
		|| msg.message.hasOwnProperty('audioMessage') 
		){
    return;
  }

  //Compatibilidad con whatsapp viejos
  const text = msg.message.hasOwnProperty('conversation') 
    ? msg.message.conversation
    : (msg.message.hasOwnProperty('extendedTextMessage') 
      ? msg.message.extendedTextMessage.text 
      : ''
      );

  const commands = text.toLowerCase().split(' ') || [];
  const command = commands[0] || '';
	const isGroup = msg.key.remoteJid.split('@')[1] === 'g.us';
	let group;
	//En grupos solos se pueden utilizar Comandos Publicos
	if (isGroup){
		
		group = await Group.findOne({ jid: msg.key.remoteJid });
		if (!group) {
			const metadata = await sock.groupMetadata(msg.key.remoteJid);
			group = await Group.create({
				jid: msg.key.remoteJid,
				subject: metadata.subject,
			});
			console.log(`New group added ${group}`);
		}
		console.log(`[${group.jid}] (${group.subject})`);
	}
  //Get Usuario (crear si no existe)
	let user;
	user = await User.findOne({ jid: isGroup ? msg.key.participant : msg.key.remoteJid });

	if (!user) {
		user = await User.create({
			jid: isGroup ? msg.key.participant : msg.key.remoteJid,
			pushName: msg.pushName,
		});
		console.log(`New user added ${user}`);
	}

  //Marcar como leido
  await sock.readMessages([msg.key]);
	
	console.log(`[${user.jid}] ${user.pushName}`);
	console.log(text);
	console.log('');

}

module.exports = handleMsg;