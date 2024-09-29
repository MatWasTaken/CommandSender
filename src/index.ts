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
  // send message on startup
  client.channels.cache.get(process.env.TEST_CHANNEL_ID).send("Hi gays!");

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
  commands.create({
    name: "reset",
    description: "Reset QOTD file from backup",
  });
  commands.create({
    name: "scheduleqotd",
    description: "Schedule a QOTD",
    options: [
      {
        name: "question",
        type: 3,
        description: "The question to schedule",
        required: true,
      },
    ],
  });
});

let scheduledQuestion: string | null = null;

function getQOTD() {
  if (scheduledQuestion) {
    const question = scheduledQuestion;
    scheduledQuestion = null; // Reset after it's been used
    return question;
  }

  const qotd = fs.readFileSync(
    path.join(__dirname, "../data/questions"),
    "utf-8"
  ).split("\n");
  const qotdIndex = Math.floor(Math.random() * qotd.length);
  const qotdQuestion = qotd[qotdIndex].toString();
  //delete the question from the file
  qotd.splice(qotdIndex, 1);
  fs.writeFileSync(
    path.join(__dirname, "../data/questions"),
    qotd.join("\n"),
    "utf-8"
  );
  return qotdQuestion;
}

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
      .setDescription(getQOTD())
      .setTimestamp();
    //Send message to general channel
    client.channels.cache
      .get(process.env.QOTD_CHANNEL_ID)
      .send({ embeds: [embededQ] });
  } else if (commandName === "resetqotd") {
    await interaction.reply("Resetting QOTD!");
    fs.writeFileSync(
      path.join(__dirname, "../data/questions"),
      fs.readFileSync(path.join(__dirname, "../data/questions_backup"), "utf-8"),
      "utf-8"
    );
  } else if (commandName === "scheduleqotd") {
    const question = interaction.options.getString("question");
    scheduledQuestion = question;
    await interaction.reply({content: `Scheduled question: ${question}`, ephemeral: true});
  }
});

// Cron job to send message every day at 16:00 CEST
const cronJob = new cron.CronJob(
  "0 0 16 * * *",
  function () {
    //Generate question in an embeded message
    const embededQ = new EmbedBuilder()
      .setTitle("❓❔ Question of the 🏳️‍🌈Gay🏳️‍🌈 ❔❓")
      .setColor("#E75EFF")
      .setDescription(getQOTD())
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
