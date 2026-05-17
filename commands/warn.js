const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user for breaking rules.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to warn")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the warning")
        .setRequired(true)
    ),

  async execute(interaction) {
    const warnedUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    // Load config
    let config = {};
    if (fs.existsSync("serverConfig.json")) {
      config = JSON.parse(fs.readFileSync("serverConfig.json"));
    }

    const server = config[interaction.guild.id];

    // DM the user
    try {
      await warnedUser.send(
        `⚠️ **You have received a warning**  
You broke the server or Discord guidelines.  
**Reason:** ${reason}`
      );
    } catch {
      // User has DMs off
    }

    // Confirm to moderator
    await interaction.reply({
      content: `⚠️ **${warnedUser.tag}** has been warned.\nReason: ${reason}`,
      ephemeral: false
    });

    // Log to logs channel if set
    if (server && server.logsChannel) {
      const logChannel = interaction.guild.channels.cache.get(server.logsChannel);
      if (logChannel) {
        logChannel.send(
          `⚠️ **Warning Issued**  
**User:** ${warnedUser.tag}  
**Warned By:** ${interaction.user.tag}  
**Reason:** ${reason}`
        );
      }
    }
  }
};
