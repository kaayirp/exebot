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
            .setDescription(`Hey there 👋  
Before accessing the full server, please verify yourself.  

Click the button below.  
⚡ Verification is instant.`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1259856192969113600/1518363715316093048/0622_1.gif')
            .setImage('https://cdn.discordapp.com/attachments/1259856192969113600/1518365172031291402/0622_1.gif');

        const button = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('Verify Me')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        message.channel.send({ embeds: [embed], components: [row] });
    }
});


// ====================================
// TICKET PANEL
// ====================================

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === '!ticketsetup') {

        const embed = new EmbedBuilder()
            .setColor('#7F00FF')
            .setTitle('🎫 EXE SUPPORT')
            .setDescription(`──────────────────────────────  
Need help? Click the button below to create a support ticket.`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1259856192969113600/1518363715316093048/0622_1.gif')
            .setImage('https://media.discordapp.net/attachments/1259856192969113600/1518371090873847929/0622_1.gif');

        const button = new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('OPEN TICKET')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        message.channel.send({ embeds: [embed], components: [row] });
    }
});


// ====================================
// BUTTON SYSTEM
// ====================================

client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;

    // VERIFY BUTTON
    if (interaction.customId === 'verify_button') {

        const verifiedRole = interaction.guild.roles.cache.get(process.env.VERIFIED_ROLE_ID);
        const unverifiedRole = interaction.guild.roles.cache.get(process.env.UNVERIFIED_ROLE_ID);

        if (!verifiedRole) {
            return interaction.reply({ content: 'Verified role not found.', ephemeral: true });
        }

        if (unverifiedRole) {
            await interaction.member.roles.remove(unverifiedRole);
        }

        await interaction.member.roles.add(verifiedRole);

        interaction.reply({ content: '✅ You are now verified!', ephemeral: true });
    }


    // OPEN TICKET
    if (interaction.customId === 'open_ticket') {

        const existing = interaction.guild.channels.cache.find(
            c => c.name === `ticket-${interaction.user.id}`
        );

        if (existing) {
            return interaction.reply({
                content: `❌ You already have a ticket: ${existing}`,
                ephemeral: true
            });
        }

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: process.env.TICKET_CATEGORY_ID,

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
                }
            ]
        });

        const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close Ticket')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(closeButton);

        const embed = new EmbedBuilder()
            .setColor('#9d00ff')
            .setTitle('🎫 Support Ticket')
            .setDescription(`Welcome ${interaction.user}  
Explain your issue and wait for support.`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1259856192969113600/1518363715316093048/0622_1.gif');

        channel.send({ embeds: [embed], components: [row] });

        interaction.reply({
            content: `✅ Ticket created: ${channel}`,
            ephemeral: true
        });
    }


    // CLOSE TICKET
    if (interaction.customId === 'close_ticket') {

        await interaction.reply({
            content: '🔒 Closing ticket in 5 seconds...'
        });

        setTimeout(() => {
            interaction.channel.delete();
        }, 5000);
    }
});


client.login(process.env.TOKEN);
