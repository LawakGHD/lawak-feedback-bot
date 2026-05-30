const {
	Client,
	GatewayIntentBits,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	EmbedBuilder
} = require('discord.js');

const express = require('express');

const app = express();

app.use(express.json());

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages
	]
});

const CHANNEL_ID = '1436760429090181242';

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

client.once('ready', () => {

	console.log(`Logged in as ${client.user.tag}`);

});

app.post('/feedback', async (req, res) => {

	try {

		const {
			player,
			userId,
			feedback,
			usage
		} = req.body;

		const channel = await client.channels.fetch(CHANNEL_ID);

		const embed = new EmbedBuilder()
			.setTitle('Feedback Submission')
			.setDescription(feedback)
			.addFields(
				{
					name: 'Player',
					value: player,
					inline: false
				},
				{
					name: 'User ID',
					value: String(userId),
					inline: true
				},
				{
					name: 'Status',
					value: 'OPEN',
					inline: true
				},
				{
					name: 'Daily Usage',
					value: usage,
					inline: true
				}
			)
			.setColor(0x2f3136)
			.setFooter({
				text: 'Feedback System'
			});

		await channel.send({
			embeds: [embed],
			components: [createDropdown()]
		});

		res.status(200).json({
			success: true
		});

	} catch (err) {

		console.error(err);

		res.status(500).json({
			error: 'Failed'
		});
	}
});

client.on('interactionCreate', async (interaction) => {

	if (!interaction.isStringSelectMenu()) return;

	if (interaction.customId !== 'feedback_status') return;

	const status = interaction.values[0];

	const oldEmbed = interaction.message.embeds[0];

	const embed = EmbedBuilder.from(oldEmbed);

	const fields = [...oldEmbed.fields];

	const statusIndex = fields.findIndex(
		field => field.name === 'Status'
	);

	fields[statusIndex] = {
		name: 'Status',
		value: status,
		inline: true
	};

	embed.setFields(fields);

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
});

app.listen(process.env.PORT || 3000, () => {

	console.log('API running.');

});

client.login(process.env.TOKEN);
