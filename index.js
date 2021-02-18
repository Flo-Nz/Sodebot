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
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// The fs.readdirSync() method will return an array of all the file names in that directory, e.g. ['ping.js', 'beep.js']. 
// The filter is there to make sure any non-JS files are left out of the array. With that array, you can loop over it and dynamically set your commands to the Collection you made above.
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}


/**************************************************
 * 
 ***** DYNAMIC EXECUTION OF COMMANDS SECTION*******
 * 
 * ***********************************************/

client.on("message", function (message) {

    // We don't want our bot to answer other bot's messages 
    if (message.author.bot || !message.content.startsWith(prefix)) {
        return;
    }
    

    // Define a commandbody which will contain the content of the message after the prefix (thanks to slice method)
    const commandBody = message.content.slice(prefix.length);
    // Args is an array containing the command and the arguments (the split method uses a regex in order to ignore multiple spaces in the commandbody)
    const args = commandBody.trim().split(/ +/);
    // Shift method will detete the first arg inside args and return it : the first arg should be our command 
    const command = args.shift().toLowerCase();

    // If our commands collection doesn't have our command, stop there.
    if (!client.commands.has(command)) {
        message.reply('cette commande n\'existe pas !')
        return;
    }

    // If a command is find, try to execute it. If it doesn't work, just send an error message but this will not crash our bot.
    try {
	    client.commands.get(command).execute(message, args);
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