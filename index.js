require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ChannelType,
    StringSelectMenuBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});


// ====================================
// VERIFY PANEL
// ====================================

client.on('messageCreate', async message => {

    if (message.author.bot) return;

    if (message.content === '!verifysetup') {

        const embed = new EmbedBuilder()
            .setColor('#7F00FF')
            .setTitle('🔰 Welcome to the Server!')
            .setDescription(`
Hey there 👋

Before accessing the full server,
please verify yourself.

Click the button below.

⚡ Verification is instant.
            `);

        const button = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('Verify Me')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
});


// ====================================
// TICKET PANEL (DROPDOWN STYLE)
// ====================================

client.on('messageCreate', async message => {

    if (message.author.bot) return;

    if (message.content === '!ticketsetup') {

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎫 SUPPORT TICKETS')
            .setDescription(`
**📌 Important Rules:**

1️⃣ Tickets without clear message will be closed  
2️⃣ Explain your issue properly  
3️⃣ Don’t spam multiple tickets  
4️⃣ No pinging staff  
5️⃣ Follow server rules  

❗ Failure may result in closure or ban  
            `);

        const select = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Select a topic...')
            .addOptions([
                {
                    label: 'Buy Ticket',
                    description: 'Purchase scripts / services',
                    emoji: '💰',
                    value: 'buy_ticket'
                },
                {
                    label: 'Support Ticket',
                    description: 'Get help from staff',
                    emoji: '📩',
                    value: 'support_ticket'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(select);

        message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
});


// ====================================
// INTERACTIONS
// ====================================

client.on('interactionCreate', async interaction => {

    // ================= VERIFY =================
    if (interaction.isButton() && interaction.customId === 'verify_button') {

        const verifiedRole = interaction.guild.roles.cache.get(process.env.VERIFIED_ROLE_ID);
        const unverifiedRole = interaction.guild.roles.cache.get(process.env.UNVERIFIED_ROLE_ID);

        if (!verifiedRole) {
            return interaction.reply({
                content: 'Verified role not found.',
                ephemeral: true
            });
        }

        if (unverifiedRole) {
            await interaction.member.roles.remove(unverifiedRole);
        }

        await interaction.member.roles.add(verifiedRole);

        return interaction.reply({
            content: '✅ You are now verified!',
            ephemeral: true
        });
    }


    // ================= DROPDOWN =================
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {

        const choice = interaction.values[0];

        const existing = interaction.guild.channels.cache.find(
            c => c.topic === interaction.user.id
        );

        if (existing) {
            return interaction.reply({
                content: `❌ You already have a ticket: ${existing}`,
                ephemeral: true
            });
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
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                },
                {
                    id: process.env.STAFF_ROLE_ID,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                }
            ]
        });

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`🎫 ${choice.replace('_', ' ').toUpperCase()}`)
            .setDescription(`
Hey ${interaction.user} 👋

Please explain your issue clearly.  
Staff will respond shortly.
            `);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Close Ticket')
                .setStyle(ButtonStyle.Danger)
        );

        channel.send({
            content: `<@${interaction.user.id}> <@&${process.env.STAFF_ROLE_ID}>`,
            embeds: [embed],
            components: [row]
        });

        return interaction.reply({
            content: `✅ Ticket created: ${channel}`,
            ephemeral: true
        });
    }


    // ================= CLOSE =================
    if (interaction.isButton() && interaction.customId === 'close_ticket') {

        await interaction.reply({
            content: '🔒 Closing ticket in 5 seconds...'
        });

        setTimeout(() => {
            interaction.channel.delete();
        }, 5000);
    }
});

client.login(process.env.TOKEN);
