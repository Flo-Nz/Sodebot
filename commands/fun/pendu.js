const Discord = require('discord.js');
const dico = require('./ressources/dico');
require('dotenv').config();


module.exports = {
	name: 'pendu',
	description: 'Un jeu du pendu !',
	aliases: ['devinette'],
	guildOnly: false,
	startedChannels: [],
	async execute(message, args) {

		try {			

			if (this.startedChannels.includes(message.channel.id)) {
				message.reply(`Le jeu du pendu est déjà lancé sur le channel !`);
				return;
			}

			// Starting the game.
			message.channel.send('Lancement du jeu du pendu !');
			this.startedChannels.push(message.channel.id);

			// GENERATE A RANDOM WORD TO FIND
			// 1 - generate a random number between 0 and the max number of values in dico
			const getRandomNumber = () => {
				const min = Math.ceil(0);
				const max = Math.floor(dico.length - 1);
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}
			// 2 - generate a wordToFind using our randomnumber as index of our array
			const wordToFind = dico[getRandomNumber()];
			console.log(wordToFind);
			// 3 - generate an array with all letters in our wordToFind
			const wordToFindLetters = wordToFind.split('');
			// 4 - replace all the values of our array with "_" in a new array
			let maskedWordToFind = wordToFind.split('').fill('_');
			// 5 - stock user answers and tries
			let userLetterAnswers = [];
			let userWordAnswers = [];
			let tries = 0;
			let fails = 0;

			// The following method is made to ignore special characters in our filter

			const specialChar = {'/': true, '@': true, '/': true, '[': true, '&': true, '#': true, ',': true, '+': true, '(': true, ')': true, '$': true, '~': true, '%': true, '.': true, ':': true, '*': true, '?': true, '<': true, '>': true, '{': true, '}': true, ']': true, 'é': true, 'è': true, 'ê': true, };

			const containsSpecialChar = (string) => {
				const stringArray = string.split('');
				for (char of stringArray) {
					if (specialChar[char]) {
						return true;
					}
				} 
				return false;
			}

			// This filter will be used to push only the answers that don't begin with the prefix, are not from a bot, and don't include spaces in the awaitMessages collection.
			const filter = msg => msg.content.startsWith(process.env.PREFIX) === false && msg.author.bot === false && msg.content.includes(' ') === false && containsSpecialChar(msg.content) === false;

			// This is the round fonction. It is async as it wait for answers, and it is also recursive while the word isn't find yet.
			const startRound = async () => {

				// Prepare an embed message
				let gameStatusEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle(`Mot à trouver : \`${maskedWordToFind.join(' ')}\``)
					.setDescription(`Nombre d'essais : ${tries}`)
					.setAuthor('Jeu du Pendu')
					.setImage(`http://www.prisma-craft.fr/images/pendu${fails}.PNG`)
					.addFields(
						{ name: 'Lettres proposées : ', value: `${userLetterAnswers.join(',') || 'aucune'}`, inline: true},
						{ name: 'Mots proposés : ', value: `${userWordAnswers.join(',') || 'aucun'}`, inline: true},
						{ name: 'Echecs : ', value: `${fails || '0'}`, inline: true},
						{ name: 'Echecs restants avant défaite', value: `${7 - fails || 7}`},
						);
				
				// If the fails counter is equal to 7, the users lost the game. We update the embed message and end the game.
				if (fails === 7) {
					gameStatusEmbed
					.setColor('#B01F00')
					.setTitle(`C'est mort ! Le mot était : ${wordToFind}`)
					.setDescription(`Vous avez perdu après ${tries} essais.`);
					message.channel.send(gameStatusEmbed);
					message.channel.send(`Pour relancer une partie, envoyez \`!pendu\``);
					this.startedChannels = this.startedChannels.filter(id => id !== message.channel.id);
					return;
				}

				// If fails counter isn't equel to 7, 
				await message.channel.send(gameStatusEmbed);
				await message.channel.awaitMessages(filter, {
						max: 1,
						time: 3600000,
						errors: ['time']
				})
				// when we have an answer, start this treatment
				.then((message => {
					// there is only one message in our "message collection" so we only stock this message into the message variable.
					message = message.first();
					message.content = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
					// First, case when we have only one letter
					if (message.content.length === 1) {
						let proposedLetter = message.content.toUpperCase();
						// If the letter is already in our userLetterAnswers array, start a new round immediately
						if (userLetterAnswers.includes(proposedLetter)) {
							message.channel.send(`La lettre ${proposedLetter} a déjà été proposée !`);
							return startRound();
						}
						// Else, push the answer into the userLetterAnswers array, increment the counter of tries and initialize the letterFound counter, and the index.
						userLetterAnswers.push(proposedLetter);
						tries++;
						message.channel.send(`${message.author} propose la lettre : ${proposedLetter}`);
						let letterFound = 0;
						let index = 0;

						// For each letter of the wordToFind array, if the proposedLetter is the same as the letter, replace the underscore in the maskedword with the proposedLetter (we can do it by the index counter so we must increment at the end of the loop).
						for (const letter of wordToFindLetters) {
							if (proposedLetter == letter) {
								maskedWordToFind[index] = proposedLetter;
								letterFound++;
							}
							index++;
						}

						// Send the correct message to the user if there is a letter found or not
						if (letterFound === 0) {
							fails++;
							message.channel.send(`C'est raté ! ${message.author} n'a pas trouvé de lettre, quel(le) naze !`);
						} else if (letterFound === 1) {
							message.channel.send(`Bravo ${message.author} ! tu as trouvé 1 lettre du mot.`);
						} else if (letterFound > 1) {
							message.channel.send(`Génial ! ${message.author} a trouvé ${letterFound} lettres. Quelle classe !`);
						}

						// If maskedwordtofind is equel to the wordtofind all the letters have been found so we can end the game.
						if (maskedWordToFind.join('') === wordToFind) {
							
							gameStatusEmbed
							.setColor('#15EC00')
							.setTitle(`Félicitation ! Le mot était bien ${wordToFind} !`)
							.setImage('https://media0.giphy.com/media/cQNRp4QA8z7B6/giphy.gif?cid=ecf05e47pbx59v5npozdfy1n05xxqjmgjh5w0sr13th0mg9h&rid=giphy.gif');
							message.channel.send(gameStatusEmbed);
							message.channel.send(`Il a fallu ${tries} essais pour trouver. N'hésitez pas à relancer en tapant la commande : \`!pendu\``);
							this.startedChannels = this.startedChannels.filter(id => id !== message.channel.id);
							return;
						// Else we start a new round.
						} else {
							return startRound();
						}

					// If the answer is a word, just see if it matches with the wordtofind or not
					} else if (message.content.length > 1) {
						let proposedWord = message.content.toUpperCase();
						if (userWordAnswers.includes(proposedWord)) {
							message.channel.send(`Le mot ${proposedWord} a déjà été proposé !`);
							return startRound();
						}
						userWordAnswers.push(proposedWord);
						tries++;
						message.channel.send(`${message.author} nous propose le mot : ${proposedWord}...`);
						if (proposedWord === wordToFind) {
							gameStatusEmbed
							.setColor('#15EC00')
							.setTitle(`Félicitation ! Le mot était bien ${wordToFind} !`)
							.setImage('https://media0.giphy.com/media/cQNRp4QA8z7B6/giphy.gif?cid=ecf05e47pbx59v5npozdfy1n05xxqjmgjh5w0sr13th0mg9h&rid=giphy.gif');
							message.channel.send(gameStatusEmbed);
							message.channel.send(`Il a fallu ${tries} essais pour trouver. N'hésitez pas à relancer en tapant la commande : \`!pendu\``);
							this.startedChannels = this.startedChannels.filter(id => id !== message.channel.id);
							return;
						} else {
							message.channel.send(`Bien tenté ! Mais... Ce n'est pas bon !`);
							return startRound();
						}
					}
				}))
				.catch (collected => {
					message.channel.send(`Le délai de réponse est terminé. Le pendu n'a pas été trouvé !`);
					this.startedChannels = this.startedChannels.filter(id => id !== message.channel.id);
					console.error(`Erreur sur le pendu après exécution du startround`, collected);
					return;
				})

			}
		startRound();
		}
		catch (error) {
			message.channel.send(`Désolé, il y a eu une erreur.`);
			console.error(`Erreur au moment du try initial du pendu`, error);
			this.startedChannels = this.startedChannels.filter(id => id !== message.channel.id);
		}

	}
}