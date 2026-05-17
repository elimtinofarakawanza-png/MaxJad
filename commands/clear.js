const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear a number of messages.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "Please choose a number between **1 and 100**.",
        ephemeral: true
      });
    }

    const deleted = await interaction.channel.bulkDelete(amount, true);

    await interaction.reply({
      content: `🧹 Deleted **${deleted.size}** messages.`,
      ephemeral: true
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
        logChannel.send(`🧹 **${interaction.user.tag}** cleared **${deleted.size}** messages in <#${interaction.channel.id}>`);
      }
    }
  }
};
