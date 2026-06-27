require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ChannelType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`${client.user.tag} is online`);
});


// ================= TICKET PANEL COMMAND =================

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === '!ticketsetup') {

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('📩 SUPPORT TICKETS')
            .setDescription(`
**📌 Rules**
• Explain clearly  
• No spam  
• No ping staff  
• Follow rules  
            `)
            .setImage('https://media.discordapp.net/attachments/1259856192969113600/1518371090873847929/0622_1.gif');

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Select a topic...')
            .addOptions([
                {
                    label: 'Support Ticket',
                    value: 'support',
                    emoji: '📩'
                },
                {
                    label: 'Buy Ticket',
                    value: 'buy',
                    emoji: '💰'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
});


// ================= INTERACTION =================

client.on('interactionCreate', async interaction => {

    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId !== 'ticket_select') return;

    await interaction.deferReply({ ephemeral: true }); // 🔥 FIX

    try {

        const choice = interaction.values[0];

        const existing = interaction.guild.channels.cache.find(
            c => c.topic === interaction.user.id
        );

        if (existing) {
            return interaction.editReply(`❌ You already have a ticket: ${existing}`);
        }

        const channel = await interaction.guild.channels.create({
            name: `${choice}-${interaction.user.username}`.toLowerCase(),
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
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                },
                {
                    id: process.env.STAFF_ROLE_ID,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                }
            ]
        });

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎫 Ticket Opened')
            .setDescription('Explain your issue, staff will respond.');

        const closeBtn = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(closeBtn);

        await channel.send({
            content: `<@${interaction.user.id}> <@&${process.env.STAFF_ROLE_ID}>`,
            embeds: [embed],
            components: [row]
        });

        await interaction.editReply(`✅ Ticket created: ${channel}`);

    } catch (err) {
        console.error(err);
        await interaction.editReply('❌ Error creating ticket');
    }
});


// ================= CLOSE BUTTON =================

client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;
    if (interaction.customId !== 'close_ticket') return;

    await interaction.reply({ content: 'Closing ticket...', ephemeral: true });

    setTimeout(() => {
        interaction.channel.delete().catch(() => {});
    }, 3000);
});


// ================= LOGIN =================

client.login(process.env.TOKEN);
