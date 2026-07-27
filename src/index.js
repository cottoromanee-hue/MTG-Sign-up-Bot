require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let eventData = {
    name: "",
    maxPlayers: 0,
    players: []
};

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

    // Create Event
    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'createevent') {

            eventData = {
                name: "Friday Night Commander",
                maxPlayers: 8,
                players: []
            };

            const embed = new EmbedBuilder()
                .setTitle("🧙 MTG Event")
                .setDescription(
                    `**${eventData.name}**\n\nPlayers: 0/${eventData.maxPlayers}`
                );

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('join')
                        .setLabel('Join')
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId('leave')
                        .setLabel('Leave')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }

    // Buttons
    if (interaction.isButton()) {

        if (interaction.customId === "join") {

            if (!eventData.players.includes(interaction.user.username)) {
                eventData.players.push(interaction.user.username);
            }

            await interaction.reply({
                content: `${interaction.user.username} joined!`,
                ephemeral: true
            });
        }

        if (interaction.customId === "leave") {

            eventData.players =
                eventData.players.filter(
                    p => p !== interaction.user.username
                );

            await interaction.reply({
                content: `${interaction.user.username} left.`,
                ephemeral: true
            });
        }
    }
});

client.login(process.env.TOKEN);
