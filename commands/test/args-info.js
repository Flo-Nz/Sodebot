module.exports = {
	name: 'args-info',
	description: 'Donne des informations sur les arguments passés',
    args: true,
    usage: '<argument1> <argument2> etc.',
	execute(message, args) {
		if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

		message.channel.send(`Arguments passés: ${args}\nNombre d'arguments: ${args.length}`);
	},
};