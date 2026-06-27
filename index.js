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


// ================= VERIFY PANEL =================

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === '!verifysetup') {

        const embed = new EmbedBuilder()
            .setColor('#7F00FF')
            .setTitle('🔰 Welcome!')
            .setDescription('Click below to verify yourself.')
            .setImage('https://media.discordapp.net/attachments/1259856192969113600/1518365172031291402/0622_1.gif');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verify_button')
                .setLabel('Verify Me')
                .setStyle(ButtonStyle.Success)
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});


// ================= TICKET PANEL =================

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === '!ticketsetup') {

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎫 SUPPORT TICKETS')
            .setDescription(`
**📌 Rules**
• Explain clearly  
• No spam  
• No ping staff  
• Follow rules  
            `)
            .setImage('https://media.discordapp.net/attachments/1259856192969113600/1518371090873847929/0622_1.gif');

        const select = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Select a topic...')
            .addOptions([
                {
                    label: 'Buy Ticket',
                    value: 'buy_ticket',
                    emoji: '💰'
                },
                {
                    label: 'Support Ticket',
                    value: 'support_ticket',
                    emoji: '📩'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(select);

        message.channel.send({ embeds: [embed], components: [row] });
    }
});


// ================= INTERACTIONS =================

client.on('interactionCreate', async interaction => {

    try {

        // ===== VERIFY =====
        if (interaction.isButton() && interaction.customId === 'verify_button') {

            await interaction.deferReply({ ephemeral: true });

            const verifiedRole = interaction.guild.roles.cache.get(process.env.VERIFIED_ROLE_ID);
            const unverifiedRole = interaction.guild.roles.cache.get(process.env.UNVERIFIED_ROLE_ID);

            if (!verifiedRole) return interaction.editReply('Role not found');

            if (unverifiedRole) await interaction.member.roles.remove(unverifiedRole);
            await interaction.member.roles.add(verifiedRole);

            return interaction.editReply('✅ Verified!');
        }


        // ===== DROPDOWN =====
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {

            await interaction.deferReply({ ephemeral: true });

            const choice = interaction.values[0];

            const existing = interaction.guild.channels.cache.find(
                c => c.topic === interaction.user.id
            );

            if (existing) {
                return interaction.editReply(`❌ Already have ticket: ${existing}`);
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
                .setTitle(`🎫 ${choice.replace('_', ' ').toUpperCase()}`)
                .setDescription(`Explain your issue. Staff will respond.`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({
                content: `<@${interaction.user.id}> <@&${process.env.STAFF_ROLE_ID}>`,
                embeds: [embed],
                components: [row]
            });

            return interaction.editReply(`✅ Created: ${channel}`);
        }


        // ===== CLOSE =====
        if (interaction.isButton() && interaction.customId === 'close_ticket') {

            await interaction.reply({ content: 'Closing...', ephemeral: true });

            setTimeout(() => {
                interaction.channel.delete();
            }, 3000);
        }

    } catch (err) {
        console.error(err);

        if (interaction.replied || interaction.deferred) {
            interaction.followUp({ content: '❌ Error', ephemeral: true });
        } else {
            interaction.reply({ content: '❌ Error', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
