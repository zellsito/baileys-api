import { Boom } from '@hapi/boom';
import makeWASocket, { WAMessage,  /* AnyMessageContent, delay, */DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MiscMessageGenerationOptions, /*MessageRetryMap, */useMultiFileAuthState } from 'baileys';
import MAIN_LOGGER from './lib/logger';
import NodeCache from 'node-cache';
import app from './app';


const logger = MAIN_LOGGER.child({ });
//logger.level = 'trace';
logger.level = 'info';

const useStore = !process.argv.includes('--no-store');

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
//const msgRetryCounterMap: MessageRetryMap = { };
const msgRetryCounterCache = new NodeCache()

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = useStore ? makeInMemoryStore({ logger }) : undefined;


let sessionFileName = `./session/baileys_store_multi.json`;
let sessionFolderName = `session/baileys_auth_info`;

store?.readFromFile(sessionFileName)
// save every 10s
setInterval(() => {
	store?.writeToFile(sessionFileName)
}, 10_000)


// start a connection
const startSock = async() => {
	//await require('./lib/mongoConnect')();
	const { state, saveCreds } = await useMultiFileAuthState(sessionFolderName)
	// fetch latest version of WA Web
	const { version, isLatest } = await fetchLatestBaileysVersion()
	console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)


	const sock = await makeWASocket({
		version,
		logger,
		syncFullHistory: true,
		printQRInTerminal: true,
		auth: state,
		//msgRetryCounterMap,
		msgRetryCounterCache,
		generateHighQualityLinkPreview: true,
		browser: [ 'LaGuia', 'Safari', '9.7.0' ],
		// implement to handle retries
		getMessage: async (key) => {
			if (store) {
				const msg = await store.loadMessage(key.remoteJid, key.id);
				return msg.message || undefined;
			}
			return { conversation: "hello" };
		},  
		patchMessageBeforeSending: (message) => {
			const requiresPatch = !!( message.buttonsMessage || message.templateMessage || message.listMessage );
			if (requiresPatch) { 
				message = { 
					viewOnceMessage: { 
						message: { 
							messageContextInfo: { 
								deviceListMetadataVersion: 2,
								deviceListMetadata: {},
							},
						...message,
						},
					},
				};
			}
			return message;
		},
		
	})


	// the process function lets you process all events that just occurred
	// efficiently in a batch
	sock.ev.process(
		// events is a map for event name => event data
		
		async(events) => {
			
			// something about the connection changed
			// maybe it closed, or we received all offline message or connection opened
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update
				if(connection === 'close') {
					// reconnect if not logged out
					if((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
						startSock();
					} else {
						console.log('Connection closed. You are logged out.');
					}
				}

				if (connection == 'open') {
					//app(sock);
					/*let fakemsg = {
						key: {
							id: '',
							//remoteJid: '120363039926320392@g.us', //cripto
							//remoteJid: '5491134475885-1471302806@g.us', //vidas
							//remoteJid: '120363066454866283@g.us',//sudoers
							//remoteJid: '5491159829139-1555373748@g.us', //grupo 9
							//remoteJid: '5491168518085@s.whatsapp.net', 
							remoteJid: '5491132997824@s.whatsapp.net', 
							//participant: '5491151044372@s.whatsapp.net', 
							//participant: undefined, //'5491169940853@s.whatsapp.net',
							},
						message: { conversation: 'queres venir a comer hoy a casa? invito todo yo' }
					}*/
					
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
					//sock.sendMessage('5491132997824@s.whatsapp.net', { text: 'en serio, dale, tipo 9 caigo' } , { quoted: fakemsg });


				}
				console.log('connection update', update)
			}

			// credentials updated -- save them
			if(events['creds.update']) {
				await saveCreds();
			}

			if(events.call) {
				console.log('recv call event', events.call);
			}

			// chat history received
			if(events['chats.set']) {
				console.log(events['chats.set']);
				const { chats, isLatest } = events['chats.set'];
				console.log(`recv ${chats.length} chats (is latest: ${isLatest})`);
			}

			// message history received
			if(events['messages.set']) {
				//console.log(events['messages.set']);
				const { messages, isLatest } = events['messages.set'];
				console.log(`recv ${messages.length} messages (is latest: ${isLatest})`);

			}

			if(events['contacts.set']) {
				//console.log(events['contacts.set']);
				const { contacts, isLatest } = events['contacts.set'];
				console.log(`recv ${contacts.length} contacts (is latest: ${isLatest})`);
			}

			// received a new message
			if(events['messages.upsert']) {
				const upsert = events['messages.upsert']
				//console.log('recv messages ', JSON.stringify(upsert, undefined, 2))
				
				if(upsert.type === 'notify' || upsert.type === 'append') {
					for(const msg of upsert.messages) {
						console.log(msg);
						if(!msg.key.fromMe) {
							//console.log('replying to', msg.key.remoteJid)
							//handleMsg(con, msg, sock);
						}
					}
				}
			}

			// messages updated like status delivered, message deleted etc.
			if( events['messages.update'] ) {
				//console.log(events['messages.update'])
			}

			if( events['message-receipt.update'] ) {
				//console.log(events['message-receipt.update'])
			}

			if(events['messages.reaction']) {
				//console.log(events['messages.reaction'])
			}

			if(events['presence.update']) {
				//console.log(events['presence.update'])
			}

			if(events['chats.update']) {
				//console.log(events['chats.update'])
			}

			if(events['chats.delete']) {
				//console.log('chats deleted ', events['chats.delete'])
			}
		}
	)
	

	return sock;
}




try {
	//const despedidor = require('./lib/despedidor');
	const sock = startSock();
	//app(sock);
	//despedidor();
} catch (e) {
	console.log(e);
}

//startSock();
