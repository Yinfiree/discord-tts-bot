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

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server started on port ${PORT}`);
});

process.on("unhandledRejection", console.error);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let connection = null; // globale
const player = createAudioPlayer();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const member = message.guild.members.cache.get(message.author.id);
  if (!member?.voice.channel) return;

  // ✅ Connecte seulement si pas déjà connecté
  if (!connection) {
    connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    connection.subscribe(player);
    console.log("🔊 Bot connecté en vocal !");
  }

  // Message TTS
  const text = `${member.displayName} dit : ${message.content}`;
  await playTTS(connection, text);
});

// LEAVE
client.on("messageCreate", async (message) => {
  if (message.content === "!leave") {
    if (connection) {
      connection.destroy();
      connection = null;
      console.log("👋 Bot déconnecté du vocal");
    }
  }
});

    // Pas connecté
    if (!connection) return;

    const member = message.guild.members.cache.get(message.author.id);
    if (!member?.voice.channel) return;

    // Lire seulement si muet
    if (!member.voice.selfMute && !member.voice.serverMute) return;

    const text = `${member.displayName} dit : ${message.content}`;

    const url = googleTTS.getAudioUrl(text, {
      lang: "fr",
      slow: false,
    });

    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());

    const stream = Readable.from(buffer);

    const resource = createAudioResource(stream);

    player.play(resource);
  } catch (err) {
    console.error("Erreur messageCreate :", err);
  }
});

player.on("error", console.error);

client.login(process.env.DISCORD_TOKEN);












