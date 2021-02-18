const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const client = new Discord.Client();

client.login();
client.on('ready', () => {
    console.log(`${client.user.username} is ready !`);
});

// On configure le préfixe de commande 
const prefix = process.env.PREFIX;

// Ce morceau de code permet de récupérer chaque message posté sur un serveur.
client.on("message", function (message) {

    // On ne veut pas que le bot réponde aux messages d'autres bots, on lui demande donc d'ignorer les messages dont l'auteur est un bot.
    if (message.author.bot) {
        return;
    }
    // On ne veut pas que le bot réponde aux messages qui ne commencent pas par le prefix 
    if (!message.content.startsWith(prefix)) {
        return;
    }

    // On initialise un commandBody qui contiendra le contenu entier de la commande tapée par l'utilisateur, en décalant la prise en compte de la longueur du préfixe
    const commandBody = message.content.slice(prefix.length);
    // On récupère un tableau contenant le nom de la commande (après le  !) ainsi que les éventuels arguments (après le !cmd )
    const arguments = commandBody.trim().split(/ +/);
    // On supprime le premier argument du tableau (il s'agit de la commande) et on la renvoie, après conversion en minuscule, à la constante command
    const command = arguments.shift().toLowerCase();

    if (command === "ping") {
        message.reply('Pong !');
    }

});
