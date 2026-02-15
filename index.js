const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} = require("@discordjs/voice");
const googleTTS = require("google-tts-api");
const { Readable } = require("stream");

process.on("unhandledRejection", console.error);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let connection;
const player = createAudioPlayer();

client.once("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    // JOIN
    if (message.content === "!join") {
      const channel = message.member.voice.channel;
      if (!channel) {
        await message.reply("Tu dois être en vocal.");
        return;
      }

      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      connection.subscribe(player);
      await message.reply("🔊 Bot connecté !");
      return;
    }

    // LEAVE
    if (message.content === "!leave") {
      if (connection) {
        connection.destroy();
        connection = null;
      }
      await message.reply("👋 Bot déconnecté.");
      return;
    }

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

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    player.play(resource);
  } catch (err) {
    console.error("Erreur messageCreate :", err);
  }
});

player.on("error", console.error);

client.login(process.env.DISCORD_TOKEN);







