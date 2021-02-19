const Discord = require('discord.js');
const dico = require('./ressources/dico');
const dotenv = require('dotenv').config();

module.exports = {
	name: 'pendu',
	description: 'Un jeu du pendu !',
	guildOnly: true,
	started: false,
	async execute(message, args) {

		try {
		
			this.started = true;
			message.channel.send('Lancement du jeu du pendu !');

			// GENERATE A RANDOM WORD TO FIND
			// 1 - generate a random number between 0 and the max number of values in dico
			const getRandomNumber = function getRandomInt(min, max) {
				min = Math.ceil(0);
				max = Math.floor(dico.length - 1);
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}
			// 2 - generate a wordToFind using our randomnumber as index of our array
			const wordToFind = dico[getRandomNumber()];
			console.log(wordToFind);
			// 3 - generate an array with all letters in our wordToFind
			const wordToFindLetters = wordToFind.split('');
			// 4 - replace all the values of our array with "_" in a new array
			let maskedWordToFind = wordToFind.split('').fill('_');
			let tries = 0;

			const filter = msg => msg.content.startsWith !== process.env.PREFIX;

			const startRound = async () => {
				await message.channel.send(`Voici le mot à trouver : \`${maskedWordToFind.join(' ')}\``)
				await message.channel.awaitMessages(filter, {
						max: 1,
						time: 30000,
						errors: ['time']
				})
				.then((message => {
					message = message.first();
					
					// Cas où le message ne contient qu'un seul caractère
					if (message.content.length === 1) {
						let proposedLetter = message.content.toUpperCase();
						tries++;
						message.channel.send(`${message.author} propose la lettre : ${proposedLetter}`);
						let letterFound = 0;
						let index = 0;
						for (const letter of wordToFindLetters) {
							if (proposedLetter == letter) {
								maskedWordToFind[index] = proposedLetter;
								letterFound++;
							}
							index++;
						}

						if (letterFound === 0) {
							message.channel.send(`C'est raté ! ${message.author} n'a pas trouvé de lettre, quel naze !`);
						} else if (letterFound === 1) {
							message.channel.send(`Bravo ${message.author} ! tu as trouvé 1 lettre du mot.`);
						} else if (letterFound > 1) {
							message.channel.send(`Génial ! ${message.author} a trouvé ${letterFound} lettres. Quelle classe !`);
						}

						if (maskedWordToFind.join('') === wordToFind) {
							message.channel.send(`FELICITATIONS ! Tu as trouvé le mot ! Il s'agissait bien de ${wordToFind}`);
							message.channel.send(`Il a fallu ${tries} essais pour trouver. N'hésitez pas à relancer en tapant la commande : \`!pendu\``);
							this.started = false;
							return;
						} else {
							startRound();
						}
					} else if (message.content.length > 1) {
						let proposedWord = message.content.toUpperCase();
						tries++;
						message.channel.send(`${message.author} nous propose le mot : ${proposedWord}...`);
						if (proposedWord === wordToFind) {
							message.channel.send(`FELICITATIONS ! Tu as trouvé le mot ! Il s'agissait bien de ${wordToFind}`);
							message.channel.send(`Il a fallu ${tries} essais pour trouver. N'hésitez pas à relancer en tapant la commande : \`!pendu\``);
							this.started = false;
							return;
						} else {
							message.channel.send(`Bien tenté ! Dommage de gâcher un essai pour ça... Ce n'est pas bon !`);
							startRound();
						}
					}
				}))
				.catch (collected => {
					message.channel.send(`Le délai de réponse est terminé. Le pendu n'a pas été trouvé !`);
					this.started = false;
					return;
				})

			}
		startRound();
		}
		catch (error) {
			message.channel.send(`Désolé, il y a eu une erreur.`);
			this.started = false;
		}

	}
}