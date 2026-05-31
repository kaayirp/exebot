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
            .setColor('#57F287')
            .setTitle('🔰 Welcome to the Server!')
            .setDescription(`
Hey there 👋

Before accessing the full server,
please verify yourself.

Click the button below.

⚡ Verification is instant.
            `)
            .setThumbnail('https://media.discordapp.net/attachments/1459397928173961216/1459398479703969804/Picsart_26-01-10_09-35-13-170.png?ex=6a0fd6bf&is=6a0e853f&hm=8f06f97747a0315d4eb15adeb48959b58927d6aeb8a1f363524ebf6349edca36&=&format=webp&quality=lossless&width=968&height=968')
            .setImage('https://media.discordapp.net/attachments/1259856192969113600/1507030907360645141/standard_2.gif?ex=6a106b67&is=6a0f19e7&hm=13ab0db9c7ccce588b2a598c97ea7c78ead1bbd75811e79963fdc596490b0c28&=&width=550&height=309');

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
            .setColor('#0048ff')
            .setTitle('🎫 EXE SUPPORT')
            .setDescription(`
──────────────────────────────

Need help?

Click the button below to create a support ticket.
            `)
            .setThumbnail('https://media.discordapp.net/attachments/1459397928173961216/1459398479703969804/Picsart_26-01-10_09-35-13-170.png?ex=6a0fd6bf&is=6a0e853f&hm=8f06f97747a0315d4eb15adeb48959b58927d6aeb8a1f363524ebf6349edca36&=&format=webp&quality=lossless&width=968&height=968')
            .setImage('https://media.discordapp.net/attachments/1259856192969113600/1509856131063742564/file_0000000099bc71fa9a36c816d02d4b36.png?ex=6a1ab299&is=6a196119&hm=9ff353ae3e750e3e58d51e56d237c944f3b61ab3ae52d2eaa404042ae0c6df68&=&format=webp&quality=lossless&width=825&height=465');

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
            .setThumbnail('https://media.discordapp.net/attachments/1259856192969113600/1506893108695011348/file_0000000089d4720bb22120b4d0dc4c85.png?ex=6a0feb11&is=6a0e9991&hm=8fc43aa65aeb323fa5a4baf1882086953a1d5efce5741ac04d4bc0fe21e42946&=&format=webp&quality=lossless&width=864&height=864');

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