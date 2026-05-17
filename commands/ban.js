const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("The user to ban")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the ban")
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No reason provided";

    // Load server config
    let config = {};
    if (fs.existsSync("serverConfig.json")) {
      config = JSON.parse(fs.readFileSync("serverConfig.json"));
    }

    const server = config[interaction.guild.id];

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: "I can't find that user in this server.",
        ephemeral: true
      });
    }

    if (!member.bannable) {
      return interaction.reply({
        content: "I cannot ban this user. They may have higher permissions than me.",
        ephemeral: true
      });
    }

    await member.ban({ reason });

    await interaction.reply({
      content: `🔨 **${target.tag}** has been banned.\nReason: ${reason}`
    });

    // Send log if logs channel is set
    if (server && server.logsChannel) {
      const logChannel = interaction.guild.channels.cache.get(server.logsChannel);
      if (logChannel) {
        logChannel.send(`🔨 **${target.tag}** was banned by **${interaction.user.tag}**\nReason: ${reason}`);
      }
    }
  }
};
