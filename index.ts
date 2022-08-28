const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//Instantiate the bot
client.on("ready", () => {
  console.log("Ready!");
  //send message
  client.channels.cache
    .get(process.env.GENERAL_CHANNEL_ID)
    .send("Hello World!");

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  let commands;
  if (guild) {
    commands = guild.commands;
  } else {
    commands = client.application?.command;
  }

  commands.create({
    name: "ping",
    description: "Ping!",
  });
});

//Command handler
client.on("interactionCreate", async (interaction: any) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(process.env.DISCORD_TOKEN);
