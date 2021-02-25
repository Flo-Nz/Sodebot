
const Discord = require('discord.js');
const dico = require('./ressources/dico');
const dotenv = require('dotenv').config();

module.exports = {
	name: 'fourchette',
	description: 'Un jeu de la fourchette !',
	aliases: ['fork', 'enfer'],
	args: true,
	guildOnly: false,
	usage: ['<Nombre Max>'],
	startedChannels: [],
	async execute(message, args) {
		
		try {

			if (this.startedChannels.includes(message.channel.id)) {
				message.reply(`Le jeu de la fourchette est déjà lancé sur le channel !`);
				return;
			}

			let userMax = parseInt(args);
			let userMin = 0;

			if (isNaN(userMax)) {
				message.reply(`${userMax} n'est pas un nombre ! \nLa bonne façon d'utiliser cette commande est celle-ci : \`${process.env.PREFIX}${this.name} ${this.usage}\``);
				return;
			}

			const getRandomNumber = (number) => {
				const min = Math.ceil(0);
				const max = Math.floor(parseInt(number));
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}

			const numberToFind = getRandomNumber(userMax);
			console.log(numberToFind);


			const filter = msg => msg.content.startsWith(process.env.PREFIX) === false && msg.author.bot === false && msg.content.includes(' ') === false && typeof parseInt(msg.content) === 'number';

			const gameRound = async () => {
				// SI LE NOMBRE ECRIT PAR LE USER EST PLUS GRAND QUE numberToFind, envoyer un message pour dire + petit
				await message.channel.send(`Choisis un nombre entre ${userMin} et ${userMax}`);
				await message.channel.awaitMessages(filter, {
					max: 1,
					time: 3600000,
					errors: ['time']
				})
				.then((message) => {
					message = message.first();

					if (message.content > numberToFind) {

						userMax = message.content;

						message.reply(`C'est moins.`);
						return gameRound();
					}

					if (message.content < numberToFind) {

						message.reply(`Choisissez un nombre plus grand que ${message}`);
					}

					if (message.content === numberToFind) {

						message.reply(`Bravo ! Vous avez trouvé.`);
					}

					if (message.content < 0) {

						message.reply(`Le nombre ne peut pas être inférieur à 0.`);
					}

					if (message.content > userMax) {

						message.reply(`Vous dépassez de votre propre fourchette. Reprenez-vous.`);
					}
										
				})
			}
		}
		catch{}
    }
}