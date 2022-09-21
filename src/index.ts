const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({path:__dirname+'/./../.env'});
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
var cron = require("cron");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

// Instantiate the bot
client.on("ready", () => {
  console.log("Ready!");
  // send message
  //client.channels.cache.get(process.env.QOTD_CHANNEL_ID).send("Hi gays!");

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
  commands.create({
    name: "fqotd",
    description: "Force QOTD",
  });
});

// Command handler
client.on("interactionCreate", async (interaction: any) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  } else if (commandName === "fqotd") {
    await interaction.reply("Forcing QOTD!");
    //Generate question in an embeded message
    const embededQ = new EmbedBuilder()
      .setTitle("❓❔ Question of the 🏳️‍🌈 Gay 🏳️‍🌈 ❔❓")
      .setColor("#E75EFF")
      .setDescription(q[Math.floor(Math.random() * q.length)])
      .setTimestamp();
    //Send message to general channel
    client.channels.cache
      .get(process.env.QOTD_CHANNEL_ID)
      .send({ embeds: [embededQ] });
  }
});

// Select random line from txt file
const file = path.join(__dirname, "../data/questions.txt");
const q = fs.readFileSync(file, "utf8").split("\n");

// Cron job to send message every day at 16:00 CEST
const cronJob = new cron.CronJob(
  "0 0 16 * * *",
  function () {
    //Generate question in an embeded message
    const embededQ = new EmbedBuilder()
      .setTitle("❓❔ Question of the 🏳️‍🌈Gay🏳️‍🌈 ❔❓")
      .setColor("#E75EFF")
      .setDescription(q[Math.floor(Math.random() * q.length)])
      .setTimestamp();
    //Send message to general channel
    client.channels.cache
      .get(process.env.QOTD_CHANNEL_ID)
      .send({ embeds: [embededQ] });
  },
  null,
  true,
  "Europe/Paris"
);
cronJob.start();

client.login(process.env.DISCORD_TOKEN);
