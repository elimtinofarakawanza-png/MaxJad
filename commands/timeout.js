const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("The user to timeout")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minutes")
        .setDescription("How long to timeout the user")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the timeout")
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const minutes = interaction.options.getInteger("minutes");
    const reason = interaction.options.getString("reason") || "No reason provided";

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: "I can't find that user in this server.",
        ephemeral: true
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: "I cannot timeout this user. They may have higher permissions than me.",
        ephemeral: true
      });
    }

    const ms = minutes * 60 * 1000;

    await member.timeout(ms, reason);

    await interaction.reply({
      content: `⏳ **${target.tag}** has been timed out for **${minutes} minutes**.\nReason: ${reason}`
    });

    // Logs
    let config = {};
    if (fs.existsSync("serverConfig.json")) {
      config = JSON.parse(fs.readFileSync("serverConfig.json"));
    }
    const server = config[interaction.guild.id];

    if (server && server.logsChannel) {
      const logChannel = interaction.guild.channels.cache.get(server.logsChannel);
      if (logChannel) {
        logChannel.send(`⏳ **${target.tag}** was timed out by **${interaction.user.tag}** for **${minutes} minutes**\nReason: ${reason}`);
      }
    }
  }
};
