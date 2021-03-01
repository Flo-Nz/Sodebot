const dotenv = require('dotenv').config();
const prefix = process.env.PREFIX || '!';

module.exports = {
	name: 'help',
	description: 'Liste toutes mes commandes ou donne de l\'info sur une commande spécifique.',
	aliases: ['commands'],
	usage: '[nom de la commande]',
	cooldown: 5,
	execute(message, args) {
		
        const data = [];
        const { commands } = message.client;

        if (args.join('').toLowerCase() == "ineedsomebody") {
                return message.reply('THE BEATLES ROCKS, BUDDY !')
        }

        if (!args.length) {
            data.push('Voici la liste de mes commandes:');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\nTu peux écrire \`${prefix}help [nom de la commande]\` pour obtenir de l'information sur une commande spécifique.`);

            return message.author.send(data, { split: true })
	        .then(() => {
		        if (message.channel.type === 'dm') return;
		        message.reply('Je t\'ai envoyé un MP avec toutes mes commandes !');
	        })
	        .catch(error => {
		    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
		    message.reply('Il semble que je ne peux pas t\'envoyer de MP... Les aurais-tu désactivés ?');
	        });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
	        return message.reply('cette commande n\'existe pas !');
        }

        data.push(`**Nom:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
        if (command.guildOnly) data.push(`**Non-utilisable en MP**`);

        data.push(`**Cooldown:** ${command.cooldown || 3} seconde(s)`);

        message.channel.send(data, { split: true });
	},
};