require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Events,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let currentEvent = null;

client.once(Events.ClientReady, () => {
    console.log(`${client.user.tag} is online!`);
});

client.on(Events.InteractionCreate, async interaction => {

    // Slash Command
    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === "createevent") {

            const format = interaction.options.getString("format");
            const day = interaction.options.getString("day");

            currentEvent = {
                format,
                day,
                players: []
            };

            const embed = createEmbed();

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("join")
                        .setLabel("Join Event")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId("leave")
                        .setLabel("Leave Event")
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.reply({
                embeds: [embed],
                components: [buttons]
            });

            currentEvent.message = await interaction.fetchReply();
        }
    }

    // Buttons
    if (interaction.isButton()) {

        if (!currentEvent) {
            return interaction.reply({
                content: "There isn't an active event.",
                ephemeral: true
            });
        }

        if (interaction.customId === "join") {

            if (!currentEvent.players.includes(interaction.user.id)) {
                currentEvent.players.push(interaction.user.id);
            }

            await updateMessage();

            return interaction.reply({
                content: "You joined!",
                ephemeral: true
            });
        }

        if (interaction.customId === "leave") {

            currentEvent.players =
                currentEvent.players.filter(
                    id => id !== interaction.user.id
                );

            await updateMessage();

            return interaction.reply({
                content: "You left the event.",
                ephemeral: true
            });
        }
    }

});

function createEmbed() {

    const playerList =
        currentEvent.players.length === 0
            ? "No players have signed up yet."
            : currentEvent.players
                .map((id, index) => `${index + 1}. <@${id}>`)
                .join("\n");

    return new EmbedBuilder()
        .setColor("Green")
        .setTitle("🎲 MTG Sign-Up")
        .addFields(
            {
                name: "Format",
                value: currentEvent.format,
                inline: true
            },
            {
                name: "Day",
                value: currentEvent.day,
                inline: true
            },
            {
                name: "Players",
                value: playerList
            }
        )
        .setFooter({
            text: `${currentEvent.players.length} player(s) signed up`
        });
}

async function updateMessage() {
    await currentEvent.message.edit({
        embeds: [createEmbed()]
    });
}

client.login(process.env.TOKEN);  
const {
    SlashCommandBuilder
} = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("createevent")
    .setDescription("Create an MTG sign-up event")

    .addStringOption(option =>
        option
            .setName("format")
            .setDescription("Choose the MTG format")
            .setRequired(true)
            .addChoices(
                { name: "Commander", value: "Commander" },
                { name: "Kingdom", value: "Kingdom" }
            ))

    .addStringOption(option =>
        option
            .setName("day")
            .setDescription("Choose the day")
            .setRequired(true)
            .addChoices(
                { name: "Monday", value: "Monday" },
                { name: "Tuesday", value: "Tuesday" },
                { name: "Wednesday", value: "Wednesday" },
                { name: "Thursday", value: "Thursday" },
                { name: "Friday", value: "Friday" },
                { name: "Saturday", value: "Saturday" },
                { name: "Sunday", value: "Sunday" }
            ));
