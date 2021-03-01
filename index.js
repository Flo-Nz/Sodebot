/**************************************************
 * 
 * REQUIRES SECTION ********
 * 
 * ***********************************************/

const fs = require('fs'); // file reader
const Discord = require('discord.js'); // discord.js lib
const dotenv = require('dotenv'); // to access .env
dotenv.config(); // to launch process.env
const prefix = process.env.PREFIX;

/**************************************************
 * 
 * COMMANDS COLLECTION PREPARATION SECTION ********
 * 
 * ***********************************************/
const client = new Discord.Client(); // start a new client

// Our commands will be available in a Discord Collection (which is an extended class of a JS Map)
client.commands = new Discord.Collection();

// dynamically retrieve all created command files.
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    // Find out all the files for each folder 
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    
    // for each file, add it to the collection
    for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
    }
}

const cooldowns = new Discord.Collection();


/**************************************************
 * 
 ***** DYNAMIC EXECUTION OF COMMANDS SECTION*******
 * 
 * ***********************************************/

client.on("message", function (message) {


    // We don't want our bot to answer other bot's messages 
    if (message.author.bot || !message.content.startsWith(prefix) || message.channel.id === process.env.IGNORED_CHANNEL) {
        return;
    }
    
    // Define a commandbody which will contain the content of the message after the prefix (thanks to slice method)
    const commandBody = message.content.slice(prefix.length);
    // Args is an array containing the command and the arguments (the split method uses a regex in order to ignore multiple spaces in the commandbody)
    const args = commandBody.trim().split(/ +/);
    // Shift method will detete the first arg inside args and return it : the first arg should be our command 
    const commandName = args.shift().toLowerCase();

    // If this code is executed, the command should exists so we make a variable which is the actual command object
    const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // If our commands collection doesn't have our command, stop there.
    if (!command) {
        message.reply(`cette commande n'existe pas ! Tape \`!help\` pour plus d'informations sur les commandes disponibles.`);
        return;
    }

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply('Tu ne peux pas faire ça !');
        }
    }

    // If the command expects arguments, we have to verify if the user specified it. If not, return an error.
    if (command.args && !args.length) {

        let reply = `tu n'as pas spécifié de paramètre !`;

        if (command.usage) {
            reply += `\nLa bonne façon d'utiliser cette commande est celle-ci : \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.reply(`${reply}`);
    } 

    // If a command is Guild-only (it means that this command must be used in a channel, not in DM) we have to check everything is correct.
    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('Je ne peux pas faire cette commande en message privé !');
    }

    // COOLDOWNS

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

	    if (now < expirationTime) {
		    const timeLeft = (expirationTime - now) / 1000;
		    return message.reply(`Merci d'attendre ${timeLeft.toFixed(1)} secondes de plus avant de réutiliser la commande \`${command.name}\` .`);
	    }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Execute the command. If there is an error, catch it and reply an error message so it won't crash our bot. 
    try {
	    command.execute(message, args);
    } catch (error) {
	    console.error(error);
	    message.reply('Il y a eu une error dans l\'exécution de cette commande !');
    }
});

/**************************************************
 * 
 ************* STARTING SECTION *******************
 * 
 * ***********************************************/

client.on('ready', () => {
    console.log(`${client.user.username} is ready !`);
});

client.login();