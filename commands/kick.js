const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("The user to kick")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the kick")
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No reason provided";

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: "I can't find that user in this server.",
        ephemeral: true
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: "I cannot kick this user. They may have higher permissions than me.",
        ephemeral: true
      });
    }

    await member.kick(reason);

    await interaction.reply({
      content: `👢 **${target.tag}** has been kicked.\nReason: ${reason}`
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
        logChannel.send(`👢 **${target.tag}** was kicked by **${interaction.user.tag}**\nReason: ${reason}`);
      }
    }
  }
};
