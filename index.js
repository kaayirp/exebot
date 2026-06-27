require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ChannelType
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`${client.user.tag} is online`);
});


// ===== PANEL COMMAND =====

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === '!ticket') {

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎫 SUPPORT TICKET')
            .setDescription('Click the button below to create a ticket.');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary)
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});


// ===== BUTTON CLICK =====

client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;

    if (interaction.customId === 'create_ticket') {

        await interaction.reply({ content: 'Creating ticket...', ephemeral: true });

        const existing = interaction.guild.channels.cache.find(
            c => c.topic === interaction.user.id
        );

        if (existing) {
            return interaction.followUp({ content: `You already have a ticket: ${existing}`, ephemeral: true });
        }

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: process.env.TICKET_CATEGORY_ID,
            topic: interaction.user.id,

            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                },
                {
                    id: process.env.STAFF_ROLE_ID,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                }
            ]
        });

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Close Ticket')
                .setStyle(ButtonStyle.Danger)
        );

        channel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [new EmbedBuilder().setDescription('Support will be with you shortly.')],
            components: [closeBtn]
        });
    }


    // ===== CLOSE =====

    if (interaction.customId === 'close_ticket') {
        await interaction.reply({ content: 'Closing ticket...', ephemeral: true });

        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 3000);
    }
});

client.login(process.env.TOKEN);
