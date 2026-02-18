const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} = require("@discordjs/voice");
const googleTTS = require("google-tts-api");
const { Readable } = require("stream");
const fetch = require("node-fetch");
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is running!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web server started on port ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let connection = null;
const player = createAudioPlayer();

// Fonction TTS
const { spawn } = require("child_process");

async function playTTS(connection, text) {
  try {
    const url = googleTTS.getAudioUrl(text, { lang: "fr", slow: false });

    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());

    const ffmpeg = spawn("ffmpeg", [
      "-i", "pipe:0",
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
      "pipe:1",
    ]);

    ffmpeg.stdin.write(buffer);
    ffmpeg.stdin.end();

    const resource = createAudioResource(ffmpeg.stdout, {
      inputType: StreamType.Raw,
    });

    player.play(resource);
    connection.subscribe(player);

  } catch (err) {
    console.error("Erreur TTS :", err);
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const member = message.guild.members.cache.get(message.author.id);
  if (!member?.voice.channel) return;

  // COMMANDES
  if (message.content === "!join") {
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      connection.subscribe(player);
      console.log("🔊 Bot connecté en vocal !");
    }
    return message.reply("🔊 Connecté !");
  }

  if (message.content === "!leave") {
    if (connection) {
      connection.destroy();
      connection = null;
      console.log("👋 Bot déconnecté du vocal");
    }
    return message.reply("👋 Déconnecté !");
  }

  // AUTO TTS (lit tout message)
  if (!connection) {
    connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    connection.subscribe(player);
    console.log("🔊 Bot connecté en vocal !");
  }

  const text = `${member.displayName} dit : ${message.content}`;
  await playTTS(connection, text);
});

player.on("error", console.error);

client.login(process.env.DISCORD_TOKEN);









