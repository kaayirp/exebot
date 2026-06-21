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
            .setDescription(`
Hey there 👋

Before accessing the full server,
please verify yourself.

Click the button below.

⚡ Verification is instant.
            `)
            .setThumbnail('https://cdn.discordapp.com/attachments/1259856192969113600/1518363715316093048/0622_1.gif?ex=6a39a5e7&is=6a385467&hm=140db728bb36c0ff78cc3370869c85d0814818fee41f9da1f2b98e438c3e6802&')
            .setImage('https://cdn.discordapp.com/attachments/1259856192969113600/1518365172031291402/0622_1.gif?ex=6a39a742&is=6a3855c2&hm=5fd3701762765f006f420bd04fb469bae1fa4a884b7371f6666baa91b1dca164&');

        const button = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('Verify Me')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(button);

        message.channel.send({
            embeds: [embed],
            components: [row]
        });

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
            .setDescription(`
──────────────────────────────

Need help?

Click the button below to create a support ticket.
            `)
            .setThumbnail('https://cdn.discordapp.com/attachments/1259856192969113600/1518363715316093048/0622_1.gif?ex=6a39a5e7&is=6a385467&hm=140db728bb36c0ff78cc3370869c85d0814818fee41f9da1f2b98e438c3e6802&')
            .setImage('https://media.discordapp.net/attachments/1259856192969113600/1518371090873847929/0622_1.gif?ex=6a39acc6&is=6a385b46&hm=bd62b2e121338a7b914b6aa8e3d52ec76563f704ed2887d97da3c4fcdb86b98a&=');

        const button = new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('OPEN TICKET')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(button);

        message.channel.send({
            embeds: [embed],
            components: [row]
        });

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
            return interaction.reply({
                content: 'Verified role not found.',
                ephemeral: true
            });
        }

        // REMOVE UNVERIFIED
        if (unverifiedRole) {
            await interaction.member.roles.remove(unverifiedRole);
        }

        // ADD VERIFIED
        await interaction.member.roles.add(verifiedRole);

        interaction.reply({
            content: '✅ You are now verified!',
            ephemeral: true
        });

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

        const row = new ActionRowBuilder()
            .addComponents(closeButton);

        const embed = new EmbedBuilder()
            .setColor('#9d00ff')
            .setTitle('🎫 Support Ticket')
            .setDescription(`
Welcome ${interaction.user}

Explain your issue and wait for support.
            `)
            .setThumbnail('https://cdn.discordapp.com/attachments/1259856192969113600/1518363715316093048/0622_1.gif?ex=6a39a5e7&is=6a385467&hm=140db728bb36c0ff78cc3370869c85d0814818fee41f9da1f2b98e438c3e6802&');

        channel.send({
            embeds: [embed],
            components: [row]
        });

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
