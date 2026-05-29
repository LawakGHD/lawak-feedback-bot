const {
	Client,
	GatewayIntentBits,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	EmbedBuilder
} = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

function createDropdown() {

	const menu = new StringSelectMenuBuilder()
		.setCustomId('feedback_status')
		.setPlaceholder('Set Feedback Status')
		.addOptions([
			{
				label: 'Resolved',
				value: 'RESOLVED',
				emoji: '✅'
			},
			{
				label: 'Investigating',
				value: 'INVESTIGATING',
				emoji: '⚠️'
			},
			{
				label: 'Invalid',
				value: 'INVALID',
				emoji: '❌'
			},
			{
				label: 'Design Feedback',
				value: 'DESIGN FEEDBACK',
				emoji: '🧠'
			},
			{
				label: 'Bug',
				value: 'BUG',
				emoji: '🐛'
			}
		]);

	return new ActionRowBuilder().addComponents(menu);
}

client.on('messageCreate', async (message) => {

	if (message.author.bot) {

		if (
			message.embeds.length > 0 &&
			message.embeds[0].title === 'Feedback Submission'
		) {

			try {

                await message.reply({
                    content: 'Feedback Controls',
                    components: [createDropdown()]
                });

				console.log('Dropdown attached.');

			} catch (err) {

				console.error(err);

			}
		}
	}

	if (message.author.bot) return;

	if (message.content === '!test') {

		const embed = new EmbedBuilder()
			.setTitle('Feedback Submission')
			.setDescription('The basement ambience became repetitive.')
			.addFields(
				{ name: 'Player', value: 'Bedul (@BedulDah)' },
				{ name: 'Status', value: 'OPEN' }
			)
			.setColor(0x2f3136);

		await message.channel.send({
			embeds: [embed],
			components: [createDropdown()]
		});
	}
});

client.on('interactionCreate', async (interaction) => {

	if (!interaction.isStringSelectMenu()) return;

	if (interaction.customId === 'feedback_status') {

		const status = interaction.values[0];

		const oldEmbed = interaction.message.embeds[0];

		const embed = EmbedBuilder.from(oldEmbed);

		const fields = [...oldEmbed.fields];

		const statusIndex = fields.findIndex(
			field => field.name === 'Status'
		);

		if (statusIndex !== -1) {

			fields[statusIndex] = {
				name: 'Status',
				value: status,
				inline: true
			};

			embed.setFields(fields);
		}

		if (status === 'RESOLVED') {
			embed.setColor(0x57F287);
		}

		if (status === 'INVESTIGATING') {
			embed.setColor(0xFEE75C);
		}

		if (status === 'INVALID') {
			embed.setColor(0xED4245);
		}

		if (status === 'DESIGN FEEDBACK') {
			embed.setColor(0x5865F2);
		}

		if (status === 'BUG') {
			embed.setColor(0xEB459E);
		}

		await interaction.update({
			embeds: [embed],
			components: [createDropdown()]
		});
	}
});

client.login(process.env.TOKEN);