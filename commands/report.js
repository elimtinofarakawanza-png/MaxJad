const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Report a user to the moderators.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user you want to report")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the report")
        .setRequired(true)
    ),

  async execute(interaction) {
    const reportedUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    // Load config
    let config = {};
    if (fs.existsSync("serverConfig.json")) {
      config = JSON.parse(fs.readFileSync("serverConfig.json"));
    }

    const server = config[interaction.guild.id];

    if (!server || !server.reportChannel) {
      return interaction.reply({
        content: "⚠️ The report channel is not set up. Ask an admin to run `/setup`.",
        ephemeral: true
      });
    }

    const reportChannel = interaction.guild.channels.cache.get(server.reportChannel);

    if (!reportChannel) {
      return interaction.reply({
        content: "⚠️ The report channel no longer exists. Ask an admin to reconfigure `/setup`.",
        ephemeral: true
      });
    }

    // Send report to the report channel
    await reportChannel.send({
      content: `🚨 **New Report Submitted**  
**Reported User:** ${reportedUser.tag}  
**Reported By:** ${interaction.user.tag}  
**Reason:** ${reason}`
    });

    // Confirm to the user
    await interaction.reply({
      content: "✅ Your report has been submitted to the moderators.",
      ephemeral: true
    });
  }
};
