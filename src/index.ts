const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
var cron = require("cron");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

// Instantiate the bot
client.on("ready", () => {
  console.log("Ready!");
  // send message
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

// Command handler
client.on("interactionCreate", async (interaction: any) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

// Select random line from txt file
const file = path.join(__dirname, "../data/questions.txt");
const q = fs.readFileSync(file, "utf8").split("\n");

// Cron job to send message every day at 16:00
const cronJob = new cron.CronJob(
  "0 0 16 * * *",
  function () {
    //Generate question in an embeded message
    const embededQ = new EmbedBuilder()
      .setTitle("❓❔ Question of the Day ❔❓")
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

// Test cron job to send message every minute
const cronJob2 = new cron.CronJob(
  "* * * * *",
  function () {
    //Generate question in an embeded message
    const embededQ = new EmbedBuilder()
      .setTitle("❓❔ Question of the Day ❔❓")
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
cronJob2.start();

client.login(process.env.DISCORD_TOKEN);
