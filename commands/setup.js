const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configure the bot for your server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName("report_channel")
        .setDescription("Channel where reports will be sent")
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName("logs_channel")
        .setDescription("Channel where moderation logs will be sent")
        .setRequired(false)
    )
    .addRoleOption(option =>
      option
        .setName("mod_role")
        .setDescription("Role that can use moderation commands")
        .setRequired(false)
    ),

  async execute(interaction) {
    const reportChannel = interaction.options.getChannel("report_channel");
    const logsChannel = interaction.options.getChannel("logs_channel");
    const modRole = interaction.options.getRole("mod_role");

    // Load or create config file
    let config = {};
    if (fs.existsSync("serverConfig.json")) {
      config = JSON.parse(fs.readFileSync("serverConfig.json"));
    }

    // Ensure server entry exists
    if (!config[interaction.guild.id]) {
      config[interaction.guild.id] = {};
    }

    if (reportChannel) {
      config[interaction.guild.id].reportChannel = reportChannel.id;
    }

    if (logsChannel) {
      config[interaction.guild.id].logsChannel = logsChannel.id;
    }

    if (modRole) {
      config[interaction.guild.id].modRole = modRole.id;
    }

    fs.writeFileSync("serverConfig.json", JSON.stringify(config, null, 2));

    await interaction.reply({
      content: "✅ Bot setup updated successfully.",
      ephemeral: true
    });
  }
};
