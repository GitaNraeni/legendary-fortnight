require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, SlashCommandBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const config = {
  prefix: '!',
  autoThreadSettings: loadSettings('autothread.json', {}),
  anonimSettings: loadSettings('anonim.json', {}),
  feedbackSettings: loadSettings('feedback.json', {}),
};

function loadSettings(file, defaultValue) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`Error loading ${file}:`, error.message);
    return defaultValue;
  }
}

function saveSettings(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${file}:`, error.message);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  updateActivityStatus();
  setInterval(updateActivityStatus, 30000); // Update status every 30 seconds

  const commands = [
    new SlashCommandBuilder()
      .setName('autothread')
      .setDescription('Kelola auto-threading untuk media atau teks')
      .addStringOption(option =>
        option.setName('type').setDescription('Jenis thread').setRequired(true).addChoices(
          { name: 'Media', value: 'media' },
          { name: 'Teks', value: 'text' }
        )
      )
      .addChannelOption(option =>
        option.setName('channel').setDescription('Kanal tujuan').setRequired(true)
      )
      .addStringOption(option =>
        option.setName('status').setDescription('Aktifkan atau nonaktifkan').setRequired(true).addChoices(
          { name: 'Aktifkan', value: 'enabled' },
          { name: 'Nonaktifkan', value: 'disabled' }
        )
      )
      .addIntegerOption(option =>
        option.setName('slowmode').setDescription('Durasi slowmode dalam detik (opsional)').setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
    new SlashCommandBuilder()
      .setName('clear')
      .setDescription('Hapus pesan')
      .addIntegerOption(option =>
        option.setName('amount').setDescription('Jumlah pesan yang akan dihapus (1-100)').setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
    new SlashCommandBuilder()
      .setName('feedback')
      .setDescription('Atur sistem umpan balik')
      .addChannelOption(option =>
        option.setName('sendchannel').setDescription('Kanal untuk mengirim prompt umpan balik').setRequired(true)
      )
      .addChannelOption(option =>
        option.setName('receivechannel').setDescription('Kanal untuk menerima umpan balik').setRequired(true)
      )
      .addStringOption(option =>
        option.setName('title').setDescription('Judul untuk prompt umpan balik (opsional)').setRequired(false)
      )
      .addStringOption(option =>
        option.setName('description').setDescription('Deskripsi untuk prompt umpan balik (opsional)').setRequired(false)
      )
      .addAttachmentOption(option =>
        option.setName('foto').setDescription('Gambar untuk embed (opsional)').setRequired(false)
      )
      .addStringOption(option =>
        option.setName('question_name').setDescription('Pertanyaan kustom untuk kolom nama (opsional)').setRequired(false)
      )
      .addStringOption(option =>
        option.setName('question_feedback').setDescription('Pertanyaan kustom untuk kolom umpan balik (opsional)').setRequired(false).setMaxLength(45)
      )
      .addStringOption(option =>
        option.setName('button_label').setDescription('Label kustom untuk tombol umpan balik (opsional)').setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('Tampilkan perintah yang tersedia'),
    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Periksa latensi bot'),
    new SlashCommandBuilder()
      .setName('setanonim')
      .setDescription('Atur pesan anonim')
      .addChannelOption(option =>
        option.setName('channel').setDescription('Kanal tujuan').setRequired(true)
      )
      .addStringOption(option =>
        option.setName('title').setDescription('Judul untuk embed anonim (opsional)').setRequired(false)
      )
      .addStringOption(option =>
        option.setName('description').setDescription('Deskripsi untuk embed anonim (opsional)').setRequired(false)
      )
      .addAttachmentOption(option =>
        option.setName('foto').setDescription('Gambar untuk embed (opsional)').setRequired(false)
      )
      .addStringOption(option =>
        option.setName('question').setDescription('Pertanyaan kustom untuk formulir (opsional)').setRequired(false)
      )
      .addStringOption(option =>
        option.setName('button_label').setDescription('Label kustom untuk tombol anonim (opsional)').setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
    new SlashCommandBuilder()
      .setName('slowmode')
      .setDescription('Atur slowmode untuk kanal')
      .addStringOption(option =>
        option.setName('status').setDescription('Aktifkan atau nonaktifkan').setRequired(true).addChoices(
          { name: 'Aktifkan', value: 'enable' },
          { name: 'Nonaktifkan', value: 'disable' }
        )
      )
      .addChannelOption(option =>
        option.setName('channel').setDescription('Kanal tujuan').setRequired(true)
      )
      .addIntegerOption(option =>
        option.setName('seconds').setDescription('Durasi slowmode dalam detik (opsional)').setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
  ];

  client.application.commands.set(commands).catch(error => {
    console.error('Error setting application commands:', error);
  });
});

client.on('guildCreate', guild => {
  console.log(`Bot ditambahkan ke server: ${guild.name} (ID: ${guild.id})`);
  updateActivityStatus();
});

function updateActivityStatus() {
  const statuses = [
    { type: 'PLAYING', message: `di ${client.guilds.cache.size} server` },
    { type: 'WATCHING', message: `autothread di ${Object.keys(config.autoThreadSettings).length} guild` },
    { type: 'LISTENING', message: `pesan anonim di ${Object.keys(config.anonimSettings).length} guild` },
    { type: 'WATCHING', message: `umpan balik di ${Object.keys(config.feedbackSettings).length} guild` },
  ];

  let statusIndex = 0;
  const update = () => {
    const { type, message } = statuses[statusIndex];
    try {
      client.user.setActivity(message, { type });
    } catch (error) {
      console.error('Error setting activity status:', error);
    }
    statusIndex = (statusIndex + 1) % statuses.length;
  };

  update();
}

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  const guildId = message.guild.id;
  const channelId = message.channel.id;

  if (message.content.startsWith(config.prefix)) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      if (command === 'ping') {
        const msg = await message.channel.send('Mengecek...').catch(() => { throw new Error('Gagal mengirim pesan ping'); });
        await msg.edit(`Pong! Latensi: ${msg.createdTimestamp - message.createdTimestamp}ms`).catch(() => { throw new Error('Gagal mengedit pesan ping'); });
      } else if (command === 'clear') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return message.reply('Anda memerlukan izin Kelola Pesan.');
        }
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
          return message.reply('Harap masukkan angka antara 1 dan 100.');
        }
        const botMember = await message.guild.members.fetch(client.user.id);
        if (!message.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ManageMessages)) {
          return message.reply('Saya memerlukan izin Kelola Pesan untuk menghapus pesan.');
        }
        await message.channel.bulkDelete(amount, true).catch(error => { throw new Error(`Gagal menghapus pesan: ${error.message}`); });
        const reply = await message.channel.send(`Berhasil menghapus ${amount} pesan.`).catch(() => { throw new Error('Gagal mengirim konfirmasi penghapusan'); });
        setTimeout(() => reply.delete().catch(() => {}), 3000);
      } else if (command === 'help') {
        await sendHelpEmbed(message.channel);
      } else if (command === 'autothread') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          return message.reply('Anda memerlukan izin Kelola Kanal.');
        }
        await handleAutoThreadCommand(message, args);
      } else if (command === 'slowmode') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          return message.reply('Anda memerlukan izin Kelola Kanal.');
        }
        await handleSlowmodeCommand(message, args);
      } else if (command === 'setanonim') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          return message.reply('Anda memerlukan izin Kelola Kanal.');
        }
        await handleSetAnonimCommand(message, args);
      } else if (command === 'feedback') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          return message.reply('Anda memerlukan izin Kelola Kanal.');
        }
        await handleFeedbackCommand(message, args);
      }
    } catch (error) {
      console.error(`Error processing command ${command}:`, error);
      await message.reply('Terjadi kesalahan saat memproses perintah Anda.').catch(() => {});
    }
  }

  try {
    const botMember = await message.guild.members.fetch(client.user.id);
    if (config.autoThreadSettings[guildId]?.media?.[channelId]?.enabled) {
      if (!message.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ViewChannel) || !message.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
        return;
      }
      if (message.attachments.size === 0 && message.content) {
        await message.delete().catch(() => {});
        const reply = await message.channel.send(`${message.author}, hanya media yang diperbolehkan di kanal ini.`).catch(() => { return; });
        setTimeout(() => reply.delete().catch(() => {}), 3000);
        return;
      }
      await createAutoThread(message, 'media');
      if (config.autoThreadSettings[guildId].media[channelId].slowmode) {
        if (message.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ManageChannels)) {
          await message.channel.setRateLimitPerUser(config.autoThreadSettings[guildId].media[channelId].slowmode).catch(error => {
            console.error('Error setting slowmode:', error);
          });
        }
      }
    } else if (config.autoThreadSettings[guildId]?.text?.[channelId]?.enabled) {
      if (!message.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ViewChannel) || !message.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
        return;
      }
      if (message.attachments.size > 0) {
        await message.delete().catch(() => {});
        const reply = await message.channel.send(`${message.author}, hanya teks yang diperbolehkan di kanal ini.`).catch(() => { return; });
        setTimeout(() => reply.delete().catch(() => {}), 3000);
        return;
      }
      await createAutoThread(message, 'text');
      if (config.autoThreadSettings[guildId].text[channelId].slowmode) {
        if (message.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ManageChannels)) {
          await message.channel.setRateLimitPerUser(config.autoThreadSettings[guildId].text[channelId].slowmode).catch(error => {
            console.error('Error setting slowmode:', error);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing message for autothread:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return;

  try {
    if (interaction.isCommand()) {
      const { commandName, options } = interaction;

      if (commandName === 'ping') {
        await interaction.reply({ content: `Pong! Latensi: ${Date.now() - interaction.createdTimestamp}ms`, ephemeral: true });
      } else if (commandName === 'clear') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return interaction.reply({ content: 'Anda memerlukan izin Kelola Pesan.', ephemeral: true });
        }
        const amount = options.getInteger('amount');
        if (amount < 1 || amount > 100) {
          return interaction.reply({ content: 'Harap masukkan angka antara 1 dan 100.', ephemeral: true });
        }
        const botMember = await interaction.guild.members.fetch(client.user.id);
        if (!interaction.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ManageMessages)) {
          return interaction.reply({ content: 'Saya memerlukan izin Kelola Pesan untuk menghapus pesan.', ephemeral: true });
        }
        await interaction.channel.bulkDelete(amount, true).catch(error => { throw new Error(`Gagal menghapus pesan: ${error.message}`); });
        await interaction.reply({ content: `Berhasil menghapus ${amount} pesan.`, ephemeral: true });
        setTimeout(() => interaction.deleteReply().catch(() => {}), 3000);
      } else if (commandName === 'help') {
        await sendHelpEmbed(interaction.channel);
        await interaction.reply({ content: 'Menu bantuan telah dikirim!', ephemeral: true });
      } else if (commandName === 'autothread') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          return interaction.reply({ content: 'Anda memerlukan izin Kelola Kanal.', ephemeral: true });
        }
        const type = options.getString('type');
        const channel = options.getChannel('channel');
        const status = options.getString('status');
        const slowmode = options.getInteger('slowmode') || 0;
        await handleAutoThreadInteraction(interaction, type, channel, status, slowmode);
      } else if (commandName === 'slowmode') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          return interaction.reply({ content: 'Anda memerlukan izin Kelola Kanal.', ephemeral: true });
        }
        const status = options.getString('status');
        const channel = options.getChannel('channel');
        const seconds = options.getInteger('seconds');
        await handleSlowmodeInteraction(interaction, status, channel, seconds);
      } else if (commandName === 'setanonim') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          return interaction.reply({ content: 'Anda memerlukan izin Kelola Kanal.', ephemeral: true });
        }
        const channel = options.getChannel('channel');
        const title = options.getString('title') || 'Pesan Anonim';
        const description = options.getString('description') || 'Klik tombol di bawah untuk mengirim pesan anonim.';
        const foto = options.getAttachment('foto');
        const question = options.getString('question') || 'Pesan Anda';
        const buttonLabel = options.getString('button_label') || 'Kirim Pesan';
        await handleSetAnonimInteraction(interaction, channel, title, description, foto, question, buttonLabel);
      } else if (commandName === 'feedback') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          return interaction.reply({ content: 'Anda memerlukan izin Kelola Kanal.', ephemeral: true });
        }
        const sendChannel = options.getChannel('sendchannel');
        const receiveChannel = options.getChannel('receivechannel');
        const title = options.getString('title') || 'Permintaan Umpan Balik';
        const description = options.getString('description') || 'Klik tombol di bawah untuk memberikan umpan balik.';
        const foto = options.getAttachment('foto');
        const questionName = options.getString('question_name') || 'Nama';
        const questionFeedback = options.getString('question_feedback') || 'Umpan Balik Anda';
        const buttonLabel = options.getString('button_label') || 'Kirim Umpan Balik';
        await handleFeedbackInteraction(interaction, sendChannel, receiveChannel, title, description, foto, questionName, questionFeedback, buttonLabel);
      }
    } else if (interaction.isButton()) {
      const guildId = interaction.guild.id;
      const channelId = interaction.channel.id;
      const botMember = await interaction.guild.members.fetch(client.user.id);

      if (interaction.customId === 'send_anon') {
        if (!interaction.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
          return interaction.reply({ content: 'Saya memerlukan izin Kirim Pesan untuk melanjutkan.', ephemeral: true });
        }
        const settings = config.anonimSettings[guildId]?.[channelId];
        if (!settings) {
          return interaction.reply({ content: 'Pesan anonim belum diatur untuk kanal ini.', ephemeral: true });
        }
        const modal = new ModalBuilder()
          .setCustomId('anon_message')
          .setTitle('Kirim Pesan Anonim')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('anon_text')
                .setLabel(settings.question || 'Pesan Anda')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );
        await interaction.showModal(modal).catch(error => {
          console.error('Error menampilkan modal anonim:', error);
          throw new Error('Gagal menampilkan modal');
        });
      } else if (interaction.customId === 'send_feedback') {
        if (!interaction.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
          return interaction.reply({ content: 'Saya memerlukan izin Kirim Pesan untuk melanjutkan.', ephemeral: true });
        }
        const settings = config.feedbackSettings[guildId]?.[channelId];
        if (!settings) {
          return interaction.reply({ content: 'Sistem umpan balik belum diatur untuk kanal ini.', ephemeral: true });
        }
        const modal = new ModalBuilder()
          .setCustomId('feedback_message')
          .setTitle('Kirim Umpan Balik')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('feedback_name')
                .setLabel(settings.questionName || 'Nama')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('feedback_text')
                .setLabel(settings.questionFeedback || 'Umpan Balik Anda')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );
        await interaction.showModal(modal).catch(error => {
          console.error('Error menampilkan modal umpan balik:', error);
          throw new Error('Gagal menampilkan modal');
        });
      } else if (interaction.customId.startsWith('reply_anon_')) {
        if (!interaction.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
          return interaction.reply({ content: 'Saya memerlukan izin Kirim Pesan untuk melanjutkan.', ephemeral: true });
        }
        const messageId = interaction.customId.split('_')[2];
        const modal = new ModalBuilder()
          .setCustomId(`anon_reply_${messageId}`)
          .setTitle('Balas Secara Anonim')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('anon_text')
                .setLabel('Balasan Anda')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );
        await interaction.showModal(modal).catch(error => {
          console.error('Error menampilkan modal balasan anonim:', error);
          throw new Error('Gagal menampilkan modal');
        });
      } else if (interaction.customId.startsWith('refresh_anon_')) {
        const settings = config.anonimSettings[guildId]?.[channelId];
        if (!settings) {
          return interaction.reply({ content: 'Pesan anonim belum diatur untuk kanal ini.', ephemeral: true });
        }
        await sendAnonimEmbed(interaction.channel, settings.title, settings.description, settings.fotoUrl, settings.buttonLabel);
        await interaction.reply({ content: 'Embed pesan anonim telah diperbarui!', ephemeral: true });
      } else if (interaction.customId.startsWith('refresh_feedback_')) {
        const settings = config.feedbackSettings[guildId]?.[channelId];
        if (!settings) {
          return interaction.reply({ content: 'Sistem umpan balik belum diatur untuk kanal ini.', ephemeral: true });
        }
        await sendFeedbackEmbed(interaction.channel, settings.title, settings.description, settings.fotoUrl, settings.buttonLabel);
        await interaction.reply({ content: 'Embed umpan balik telah diperbarui!', ephemeral: true });
      } else if (interaction.customId.startsWith('reply_feedback_')) {
        if (!interaction.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
          return interaction.reply({ content: 'Saya memerlukan izin Kirim Pesan untuk melanjutkan.', ephemeral: true });
        }
        const messageId = interaction.message.id;
        const modal = new ModalBuilder()
          .setCustomId(`feedback_reply_${messageId}`)
          .setTitle('Balas Umpan Balik')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('feedback_reply_text')
                .setLabel('Balasan Anda')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );
        await interaction.showModal(modal).catch(error => {
          console.error('Error menampilkan modal balasan umpan balik:', error);
          throw new Error('Gagal menampilkan modal');
        });
      }
    } else if (interaction.isModalSubmit()) {
      const guildId = interaction.guild.id;
      const channelId = interaction.channel.id;

      if (interaction.customId === 'anon_message') {
        const messageContent = interaction.fields.getTextInputValue('anon_text');
        await sendAnonMessage(interaction, messageContent, channelId, guildId);
      } else if (interaction.customId.startsWith('anon_reply_')) {
        const messageId = interaction.customId.split('_')[2];
        const replyContent = interaction.fields.getTextInputValue('anon_text');
        await sendAnonReply(interaction, replyContent, channelId, guildId, messageId);
      } else if (interaction.customId === 'feedback_message') {
        const name = interaction.fields.getTextInputValue('feedback_name');
        const feedbackText = interaction.fields.getTextInputValue('feedback_text');
        await sendFeedback(interaction, name, feedbackText, channelId, guildId);
      } else if (interaction.customId.startsWith('feedback_reply_')) {
        const embed = interaction.message.embeds[0];
        if (!embed || !embed.footer?.text) {
          return interaction.reply({ content: 'Error: Pesan umpan balik tidak memiliki ID pengguna.', ephemeral: true });
        }
        const userId = embed.footer.text.split('User ID: ')[1];
        if (!userId) {
          return interaction.reply({ content: 'Error: ID pengguna tidak valid dalam pesan umpan balik.', ephemeral: true });
        }
        const replyContent = interaction.fields.getTextInputValue('feedback_reply_text');
        try {
          const user = await client.users.fetch(userId).catch(() => { throw new Error('Pengguna tidak ditemukan'); });
          await user.send(replyContent).catch(error => {
            console.error('Error mengirim DM:', error);
            throw new Error('Gagal mengirim balasan melalui DM');
          });
          await interaction.message.edit({ components: [] }).catch(error => {
            console.error('Error mengedit pesan:', error);
          });
          await interaction.reply({ content: 'Balasan Anda telah dikirim melalui DM!', ephemeral: true });
        } catch (error) {
          console.error('Error memproses balasan umpan balik:', error);
          await interaction.reply({ content: 'Gagal mengirim balasan. Pengguna mungkin menonaktifkan DM.', ephemeral: true });
        }
      }
    }
  } catch (error) {
    console.error('Error memproses interaksi:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Terjadi kesalahan saat memproses interaksi Anda.', ephemeral: true }).catch(() => {});
    } else if (interaction.deferred) {
      await interaction.editReply({ content: 'Terjadi kesalahan saat memproses interaksi Anda.' }).catch(() => {});
    }
  }
});

async function handleAutoThreadCommand(message, args) {
  if (args.length < 3) {
    return message.reply('Penggunaan: !autothread <media|text> <#channel> <enabled|disabled> [slowmode_seconds]');
  }
  const type = args[0].toLowerCase();
  const channel = message.mentions.channels.first();
  const status = args[2].toLowerCase();
  const slowmode = parseInt(args[3]) || 0;

  if (!['media', 'text'].includes(type) || !channel || !['enabled', 'disabled'].includes(status)) {
    return message.reply('Argumen tidak valid. Penggunaan: !autothread <media|text> <#channel> <enabled|disabled> [slowmode_seconds]');
  }

  const guildId = message.guild.id;
  const botMember = await message.guild.members.fetch(client.user.id);
  if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ManageThreads)) {
    return message.reply('Saya memerlukan izin Kelola Thread untuk mengatur auto-threading.');
  }

  try {
    if (!config.autoThreadSettings[guildId]) config.autoThreadSettings[guildId] = { media: {}, text: {} };
    if (status === 'enabled') {
      config.autoThreadSettings[guildId][type][channel.id] = { enabled: true, slowmode };
      console.log(`Auto-thread ${type} diaktifkan untuk kanal ${channel.name} di guild ${message.guild.name}${slowmode ? ` dengan slowmode ${slowmode}s` : ''}`);
      await message.reply({ content: `Auto-thread ${type} diaktifkan untuk ${channel}${slowmode ? ` dengan slowmode ${slowmode}s` : ''}.`, ephemeral: true });
    } else {
      delete config.autoThreadSettings[guildId][type][channel.id];
      console.log(`Auto-thread ${type} dinonaktifkan untuk kanal ${channel.name} di guild ${message.guild.name}`);
      await message.reply({ content: `Auto-thread ${type} dinonaktifkan untuk ${channel}.`, ephemeral: true });
    }
    saveSettings('autothread.json', config.autoThreadSettings);
  } catch (error) {
    console.error('Error menangani perintah autothread:', error);
    await message.reply('Gagal mengatur auto-threading. Silakan coba lagi.').catch(() => {});
  }
}

async function handleAutoThreadInteraction(interaction, type, channel, status, slowmode) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guild.id;
  const botMember = await interaction.guild.members.fetch(client.user.id);
  if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ManageThreads)) {
    return interaction.editReply({ content: 'Saya memerlukan izin Kelola Thread untuk mengatur auto-threading.' });
  }

  try {
    if (!config.autoThreadSettings[guildId]) config.autoThreadSettings[guildId] = { media: {}, text: {} };
    if (status === 'enabled') {
      config.autoThreadSettings[guildId][type][channel.id] = { enabled: true, slowmode };
      console.log(`Auto-thread ${type} diaktifkan untuk kanal ${channel.name} di guild ${interaction.guild.name}${slowmode ? ` dengan slowmode ${slowmode}s` : ''}`);
      await interaction.editReply({ content: `Auto-thread ${type} diaktifkan untuk ${channel}${slowmode ? ` dengan slowmode ${slowmode}s` : ''}.` });
    } else {
      delete config.autoThreadSettings[guildId][type][channel.id];
      console.log(`Auto-thread ${type} dinonaktifkan untuk kanal ${channel.name} di guild ${interaction.guild.name}`);
      await interaction.editReply({ content: `Auto-thread ${type} dinonaktifkan untuk ${channel}.` });
    }
    saveSettings('autothread.json', config.autoThreadSettings);
  } catch (error) {
    console.error('Error menangani interaksi autothread:', error);
    await interaction.editReply({ content: 'Gagal mengatur auto-threading. Silakan coba lagi.' });
  }
}

async function handleSlowmodeCommand(message, args) {
  if (args.length < 2) {
    return message.reply('Penggunaan: !slowmode <enable|disable> <#channel> [seconds]');
  }
  const status = args[0].toLowerCase();
  const channel = message.mentions.channels.first();
  const seconds = parseInt(args[2]);

  if (!['enable', 'disable'].includes(status) || !channel) {
    return message.reply('Argumen tidak valid. Penggunaan: !slowmode <enable|disable> <#channel> [seconds]');
  }

  const botMember = await message.guild.members.fetch(client.user.id);
  if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ManageChannels)) {
    return message.reply('Saya memerlukan izin Kelola Kanal untuk mengatur slowmode.');
  }

  try {
    if (status === 'enable') {
      const duration = seconds || 60;
      await channel.setRateLimitPerUser(duration);
      console.log(`Slowmode diaktifkan untuk kanal ${channel.name} di guild ${message.guild.name} (${duration}s)`);
      await message.reply(`Slowmode diaktifkan untuk ${channel} (${duration}s).`);
    } else {
      await channel.setRateLimitPerUser(0);
      console.log(`Slowmode dinonaktifkan untuk kanal ${channel.name} di guild ${message.guild.name}`);
      await message.reply(`Slowmode dinonaktifkan untuk ${channel}.`);
    }
  } catch (error) {
    console.error('Error mengatur slowmode:', error);
    await message.reply('Gagal mengatur slowmode. Pastikan saya memiliki izin Kelola Kanal.').catch(() => {});
  }
}

async function handleSlowmodeInteraction(interaction, status, channel, seconds) {
  await interaction.deferReply({ ephemeral: true });

  const botMember = await interaction.guild.members.fetch(client.user.id);
  if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.ManageChannels)) {
    return interaction.editReply({ content: 'Saya memerlukan izin Kelola Kanal untuk mengatur slowmode.' });
  }

  try {
    if (status === 'enable') {
      const duration = seconds || 60;
      await channel.setRateLimitPerUser(duration);
      console.log(`Slowmode diaktifkan untuk kanal ${channel.name} di guild ${interaction.guild.name} (${duration}s)`);
      await interaction.editReply({ content: `Slowmode diaktifkan untuk ${channel} (${duration}s).` });
    } else {
      await channel.setRateLimitPerUser(0);
      console.log(`Slowmode dinonaktifkan untuk kanal ${channel.name} di guild ${interaction.guild.name}`);
      await interaction.editReply({ content: `Slowmode dinonaktifkan untuk ${channel}.` });
    }
  } catch (error) {
    console.error('Error mengatur slowmode:', error);
    await interaction.editReply({ content: 'Gagal mengatur slowmode. Pastikan saya memiliki izin Kelola Kanal.' });
  }
}

async function handleSetAnonimCommand(message, args) {
  if (args.length < 1) {
    return message.reply('Penggunaan: !setanonim <#channel> [title] [description] [foto] [question] [button_label]');
  }
  const channel = message.mentions.channels.first();
  if (!channel) {
    return message.reply('Argumen tidak valid. Penggunaan: !setanonim <#channel> [title] [description] [foto] [question] [button_label]');
  }

  const guildId = message.guild.id;
  const botMember = await message.guild.members.fetch(client.user.id);
  if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
    return message.reply('Saya memerlukan izin Kirim Pesan untuk mengatur pesan anonim.');
  }

  let title = 'Pesan Anonim';
  let description = 'Klik tombol di bawah untuk mengirim pesan anonim.';
  let fotoUrl = null;
  let question = 'Pesan Anda';
  let buttonLabel = 'Kirim Pesan';
  const content = args.slice(1).join(' ');
  if (content.includes('"')) {
    const parts = content.split('"').filter(part => part.trim());
    if (parts.length >= 1) title = parts[0].trim() || title;
    if (parts.length >= 2) description = parts[1].trim() || description;
    if (parts.length >= 3) question = parts[2].trim() || question;
    if (parts.length >= 4) buttonLabel = parts[3].trim() || buttonLabel;
  } else {
    title = content.trim() || title;
  }

  try {
    if (!config.anonimSettings[guildId]) config.anonimSettings[guildId] = {};
    config.anonimSettings[guildId][channel.id] = { enabled: true, title, description, fotoUrl, question, buttonLabel };
    console.log(`Pesan anonim diatur untuk kanal ${channel.name} di guild ${message.guild.name} dengan judul: ${title}, deskripsi: ${description}, pertanyaan: ${question}, tombol: ${buttonLabel}`);
    await sendAnonimEmbed(channel, title, description, fotoUrl, buttonLabel);
    await message.reply({ content: `Pesan anonim diatur untuk ${channel} dengan judul: ${title}, deskripsi: ${description}, pertanyaan: ${question}, tombol: ${buttonLabel}.`, ephemeral: true });
    saveSettings('anonim.json', config.anonimSettings);
  } catch (error) {
    console.error('Error mengatur pesan anonim:', error);
    await message.reply('Gagal mengatur pesan anonim. Pastikan saya memiliki izin Kirim Pesan.').catch(() => {});
  }
}

async function handleSetAnonimInteraction(interaction, channel, title, description, foto, question, buttonLabel) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guild.id;
  const botMember = await interaction.guild.members.fetch(client.user.id);
  if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
    return interaction.editReply({ content: 'Saya memerlukan izin Kirim Pesan untuk mengatur pesan anonim.' });
  }

  try {
    const fotoUrl = foto ? foto.url : null;
    if (!config.anonimSettings[guildId]) config.anonimSettings[guildId] = {};
    config.anonimSettings[guildId][channel.id] = { enabled: true, title, description, fotoUrl, question, buttonLabel };
    console.log(`Pesan anonim diatur untuk kanal ${channel.name} di guild ${interaction.guild.name} dengan judul: ${title}, deskripsi: ${description}, pertanyaan: ${question}, tombol: ${buttonLabel}`);
    await sendAnonimEmbed(channel, title, description, fotoUrl, buttonLabel);
    await interaction.editReply({ content: `Pesan anonim diatur untuk ${channel} dengan judul: ${title}, deskripsi: ${description}, pertanyaan: ${question}, tombol: ${buttonLabel}.` });
    saveSettings('anonim.json', config.anonimSettings);
  } catch (error) {
    console.error('Error mengatur pesan anonim:', error);
    await interaction.editReply({ content: 'Gagal mengatur pesan anonim. Pastikan saya memiliki izin Kirim Pesan.' });
  }
}

async function handleFeedbackCommand(message, args) {
  if (args.length < 2) {
    return message.reply('Penggunaan: !feedback <#sendchannel> <#receivechannel> [title] [description] [foto] [question_name] [question_feedback] [button_label]');
  }
  const sendChannel = message.mentions.channels.first();
  const receiveChannel = message.mentions.channels.at(1);
  if (!sendChannel || !receiveChannel) {
    return message.reply('Argumen tidak valid. Penggunaan: !feedback <#sendchannel> <#receivechannel> [title] [description] [foto] [question_name] [question_feedback] [button_label]');
  }

  const guildId = message.guild.id;
  const botMember = await message.guild.members.fetch(client.user.id);
  if (!sendChannel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages) || !receiveChannel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
    return message.reply('Saya memerlukan izin Kirim Pesan di kedua kanal (pengirim dan penerima).');
  }

  let title = 'Permintaan Umpan Balik';
  let description = 'Klik tombol di bawah untuk memberikan umpan balik.';
  let fotoUrl = null;
  let questionName = 'Nama';
  let questionFeedback = 'Umpan Balik Anda';
  let buttonLabel = 'Kirim Umpan Balik';
  const content = args.slice(2).join(' ');
  if (content.includes('"')) {
    const parts = content.split('"').filter(part => part.trim());
    if (parts.length >= 1) title = parts[0].trim() || title;
    if (parts.length >= 2) description = parts[1].trim() || description;
    if (parts.length >= 3) questionName = parts[2].trim() || questionName;
    if (parts.length >= 4) questionFeedback = parts[3].trim() || questionFeedback;
    if (parts.length >= 5) buttonLabel = parts[4].trim() || buttonLabel;
  } else {
    title = content.trim() || title;
  }

  try {
    if (!config.feedbackSettings[guildId]) config.feedbackSettings[guildId] = {};
    config.feedbackSettings[guildId][sendChannel.id] = { receiveChannelId: receiveChannel.id, title, description, fotoUrl, questionName, questionFeedback, buttonLabel };
    console.log(`Umpan balik diatur untuk kanal pengirim ${sendChannel.name} ke kanal penerima ${receiveChannel.name} di guild ${message.guild.name}`);
    await sendFeedbackEmbed(sendChannel, title, description, fotoUrl, buttonLabel);
    await message.reply({ content: `Umpan balik diatur untuk ${sendChannel} ke ${receiveChannel} dengan judul: ${title}, deskripsi: ${description}, pertanyaan_nama: ${questionName}, pertanyaan_umpan_balik: ${questionFeedback}, tombol: ${buttonLabel}.`, ephemeral: true });
    saveSettings('feedback.json', config.feedbackSettings);
  } catch (error) {
    console.error('Error mengatur umpan balik:', error);
    await message.reply('Gagal mengatur sistem umpan balik. Pastikan saya memiliki izin Kirim Pesan di kedua kanal.').catch(() => {});
  }
}

async function handleFeedbackInteraction(interaction, sendChannel, receiveChannel, title, description, foto, questionName, questionFeedback, buttonLabel) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guild.id;
  const botMember = await interaction.guild.members.fetch(client.user.id);
  if (!sendChannel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages) || !receiveChannel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
    return interaction.editReply({ content: 'Saya memerlukan izin Kirim Pesan di kedua kanal (pengirim dan penerima).' });
  }

  try {
    const fotoUrl = foto ? foto.url : null;
    if (!config.feedbackSettings[guildId]) config.feedbackSettings[guildId] = {};
    config.feedbackSettings[guildId][sendChannel.id] = { receiveChannelId: receiveChannel.id, title, description, fotoUrl, questionName, questionFeedback, buttonLabel };
    console.log(`Umpan balik diatur untuk kanal pengirim ${sendChannel.name} ke kanal penerima ${receiveChannel.name} di guild ${interaction.guild.name}`);
    await sendFeedbackEmbed(sendChannel, title, description, fotoUrl, buttonLabel);
    await interaction.editReply({ content: `Umpan balik diatur untuk ${sendChannel} ke ${receiveChannel} dengan judul: ${title}, deskripsi: ${description}, pertanyaan_nama: ${questionName}, pertanyaan_umpan_balik: ${questionFeedback}, tombol: ${buttonLabel}.` });
    saveSettings('feedback.json', config.feedbackSettings);
  } catch (error) {
    console.error('Error mengatur umpan balik:', error);
    await interaction.editReply({ content: 'Gagal mengatur sistem umpan balik. Pastikan saya memiliki izin Kirim Pesan di kedua kanal.' });
  }
}

async function createAutoThread(message, type) {
  const botMember = await message.guild.members.fetch(client.user.id);
  const requiredPermissions = [PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel];
  for (const perm of requiredPermissions) {
    if (!message.channel.permissionsFor(botMember).has(perm)) {
      console.error(`Bot tidak memiliki izin ${perm}`);
      await message.channel.send({ content: `Saya memerlukan izin ${perm} untuk membuat thread.`, ephemeral: true }).catch(() => {});
      return;
    }
  }

  try {
    const threadName = type === 'text' && message.content
      ? message.content.slice(0, 100) || `${message.author.username} thread ${type}`
      : (type === 'media' && message.content ? message.content.slice(0, 100) : (type === 'media' && message.attachments.size > 0 && !message.content ? `${message.author.username} thread media` : `${message.author.username} thread ${type}`));
    const thread = await message.startThread({
      name: threadName,
      autoArchiveDuration: 60,
    }).catch(error => { throw new Error(`Gagal membuat thread: ${error.message}`); });

    await thread.send({
      content: `Thread dibuat oleh ${message.author}!`,
    }).catch(error => { throw new Error(`Gagal mengirim pesan thread: ${error.message}`); });

    await message.react('✅').catch(() => {});
  } catch (error) {
    console.error('Error membuat thread:', error);
    await message.channel.send({ content: 'Gagal membuat thread. Pastikan saya memiliki izin Kelola Thread.', ephemeral: true }).catch(() => {});
  }
}

async function sendAnonimEmbed(channel, title, description, fotoUrl, buttonLabel) {
  const botMember = await channel.guild.members.fetch(client.user.id);
  if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
    console.error('Bot tidak memiliki izin Kirim Pesan');
    return;
  }

  try {
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor('#0099ff');
    if (fotoUrl) embed.setImage(fotoUrl);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('send_anon')
        .setLabel(buttonLabel)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`refresh_anon_${channel.id}`)
        .setLabel('Perbarui')
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [row] }).catch(error => { throw new Error(`Gagal mengirim embed anonim: ${error.message}`); });
  } catch (error) {
    console.error('Error mengirim embed anonim:', error);
  }
}

async function sendAnonMessage(interaction, content, channelId, guildId) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => { throw new Error('Kanal tidak ditemukan'); });
    const botMember = await interaction.guild.members.fetch(client.user.id);
    if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.editReply({ content: 'Saya memerlukan izin Kirim Pesan untuk mengirim pesan anonim.' });
    }

    const settings = config.anonimSettings[guildId]?.[channelId];
    if (!settings) {
      return interaction.editReply({ content: 'Pesan anonim belum diatur untuk kanal ini.' });
    }

    const embed = new EmbedBuilder()
      .setTitle('Pesan Anonim')
      .setDescription(content)
      .setColor('#0099ff')
      .setTimestamp();

    const anonMessage = await channel.send({ embeds: [embed] }).catch(error => { throw new Error(`Gagal mengirim pesan anonim: ${error.message}`); });
    
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('send_anon')
        .setLabel(settings.buttonLabel)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`reply_anon_${anonMessage.id}`)
        .setLabel('Balas')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`refresh_anon_${channelId}`)
        .setLabel('Perbarui')
        .setStyle(ButtonStyle.Secondary)
    );

    await anonMessage.edit({ components: [row] }).catch(error => {
      console.error('Error mengedit pesan anonim:', error);
    });
    await interaction.editReply({ content: 'Pesan anonim Anda telah dikirim!' });
  } catch (error) {
    console.error('Error mengirim pesan anonim:', error);
    await interaction.editReply({ content: 'Gagal mengirim pesan anonim. Pastikan saya memiliki izin Kirim Pesan.' });
  }
}

async function sendAnonReply(interaction, content, channelId, guildId, messageId) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => { throw new Error('Kanal tidak ditemukan'); });
    const botMember = await interaction.guild.members.fetch(client.user.id);
    const requiredPermissions = [
      PermissionsBitField.Flags.ManageThreads,
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.SendMessages
    ];

    for (const perm of requiredPermissions) {
      if (!channel.permissionsFor(botMember).has(perm)) {
        console.error(`Bot tidak memiliki izin ${perm} di kanal ${channel.name}`);
        await interaction.editReply({ content: `Saya memerlukan izin ${perm} untuk mengirim balasan di kanal ini.` });
        return;
      }
    }

    let originalMessage;
    try {
      originalMessage = await channel.messages.fetch(messageId).catch(() => { throw new Error('Pesan asli tidak ditemukan'); });
    } catch (error) {
      console.error('Error mengambil pesan asli:', error);
      await interaction.editReply({ content: 'Pesan asli tidak ditemukan. Mungkin telah dihapus.' });
      return;
    }

    let thread = originalMessage.thread;
    if (!thread) {
      const threadName = originalMessage.embeds[0]?.description?.slice(0, 100) || 'Thread Balasan Anonim';
      thread = await originalMessage.startThread({
        name: threadName,
        autoArchiveDuration: 60,
      }).catch(error => { throw new Error(`Gagal membuat thread: ${error.message}`); });
    }

    const embed = new EmbedBuilder()
      .setTitle('Balasan Anonim')
      .setDescription(content)
      .setColor('#0099ff')
      .setTimestamp();

    await thread.send({ embeds: [embed] }).catch(error => { throw new Error(`Gagal mengirim pesan thread: ${error.message}`); });
    await originalMessage.react('❤️').catch(() => {});
    await interaction.editReply({ content: 'Balasan anonim Anda telah dikirim!' });
  } catch (error) {
    console.error('Error dalam sendAnonReply:', error);
    await interaction.editReply({ content: `Gagal mengirim balasan: ${error.message}` });
  }
}

async function sendFeedbackEmbed(channel, title, description, fotoUrl, buttonLabel) {
  const botMember = await channel.guild.members.fetch(client.user.id);
  if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
    console.error('Bot tidak memiliki izin Kirim Pesan');
    return;
  }

  try {
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor('#00ff00');
    if (fotoUrl) embed.setImage(fotoUrl);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('send_feedback')
        .setLabel(buttonLabel)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`refresh_feedback_${channel.id}`)
        .setLabel('Perbarui')
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [row] }).catch(error => { throw new Error(`Gagal mengirim embed umpan balik: ${error.message}`); });
  } catch (error) {
    console.error('Error mengirim embed umpan balik:', error);
  }
}

async function sendFeedback(interaction, name, feedbackText, channelId, guildId) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => { throw new Error('Kanal pengirim tidak ditemukan'); });
    const settings = config.feedbackSettings[guildId]?.[channelId];
    if (!settings) {
      return interaction.editReply({ content: 'Sistem umpan balik belum diatur untuk kanal ini.' });
    }

    const receiveChannel = await interaction.guild.channels.fetch(settings.receiveChannelId).catch(() => { throw new Error('Kanal penerima tidak ditemukan'); });
    const botMember = await interaction.guild.members.fetch(client.user.id);
    if (!receiveChannel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.editReply({ content: 'Saya memerlukan izin Kirim Pesan di kanal penerima.' });
    }

    const embed = new EmbedBuilder()
      .setTitle(`Umpan Balik dari ${name}`)
      .setDescription(feedbackText)
      .setColor('#00ff00')
      .setTimestamp()
      .setFooter({ text: `User ID: ${interaction.user.id}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`reply_feedback_${interaction.user.id}`)
        .setLabel('Balas')
        .setStyle(ButtonStyle.Secondary)
    );

    await receiveChannel.send({ embeds: [embed], components: [row] }).catch(error => { throw new Error(`Gagal mengirim umpan balik: ${error.message}`); });
    await interaction.editReply({ content: 'Umpan balik Anda telah dikirim!' });
  } catch (error) {
    console.error('Error mengirim umpan balik:', error);
    await interaction.editReply({ content: 'Gagal mengirim umpan balik. Pastikan saya memiliki izin Kirim Pesan di kanal penerima.' });
  }
}

async function sendHelpEmbed(channel) {
  const botMember = await channel.guild.members.fetch(client.user.id);
  if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) {
    console.error('Bot tidak memiliki izin Kirim Pesan untuk embed bantuan');
    return;
  }

  try {
    const embed = new EmbedBuilder()
      .setTitle('Perintah Bot')
      .setDescription('Perintah yang tersedia untuk bot:')
      .addFields(
        { name: '/autothread', value: 'Kelola auto-threading untuk kanal media atau teks' },
        { name: '/clear', value: 'Hapus jumlah pesan yang ditentukan' },
        { name: '/feedback', value: 'Atur sistem umpan balik di kanal' },
        { name: '/help', value: 'Tampilkan menu bantuan ini' },
        { name: '/ping', value: 'Periksa latensi bot' },
        { name: '/setanonim', value: 'Atur pesan anonim di kanal' },
        { name: '/slowmode', value: 'Aktifkan atau nonaktifkan slowmode untuk kanal' }
      )
      .setColor('#0099ff');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Server Dukungan')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/sKhq75JruK'),
      new ButtonBuilder()
        .setLabel('Undang Bot')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/oauth2/authorize?client_id=1349536671359565884&permissions=8&integration_type=0&scope=bot+applications.commands'),
      new ButtonBuilder()
        .setLabel('Donasi')
        .setStyle(ButtonStyle.Link)
        .setURL('https://saweria.co/raenear')
    );

    await channel.send({ embeds: [embed], components: [row] }).catch(error => { throw new Error(`Gagal mengirim embed bantuan: ${error.message}`); });
  } catch (error) {
    console.error('Error mengirim embed bantuan:', error);
  }
}

client.login(process.env.TOKEN).catch(error => {
  console.error('Gagal login:', error);
  process.exit(1);
});