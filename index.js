require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Partials
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.GuildMember]
});

/*
|--------------------------------------------------------------------------
| IDS DES RÔLES
|--------------------------------------------------------------------------
|
| Remplace les valeurs ci-dessous par les IDs de tes rôles Discord.
|
*/

const VERIFIED_ROLE = '1500535255231107104';
const UNVERIFIED_ROLE = '1514673663562088621';

const WRONG_ROLES = [
    '1514826951653855464',
    '1514827644384968814',
    '1514827820042551386'
];

client.once('ready', () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {

    try {

        const hasVerified =
            newMember.roles.cache.has(VERIFIED_ROLE);

        const hasWrongRole =
            WRONG_ROLES.some(role =>
                newMember.roles.cache.has(role)
            );

        /*
        |--------------------------------------------------------------------------
        | CAS TRICHE
        |--------------------------------------------------------------------------
        |
        | Le membre possède le rôle vérifié ET au moins une mauvaise réponse.
        |
        */

        if (hasVerified && hasWrongRole) {

            if (newMember.roles.cache.has(VERIFIED_ROLE)) {
                await newMember.roles.remove(VERIFIED_ROLE);
            }

            if (!newMember.roles.cache.has(UNVERIFIED_ROLE)) {
                await newMember.roles.add(UNVERIFIED_ROLE);
            }

            try {

                await newMember.send(
`🐢 Bonjour voyageur,

Nous avons détecté que plusieurs réponses ont été sélectionnées lors de la vérification.

Pour accéder à l'Île de la Tortue, vous devez retrouver le mot caché dans le règlement et sélectionner uniquement la bonne réponse.

Votre accès n'a donc pas pu être validé.

📜 Merci de relire attentivement le règlement puis de réessayer.

À bientôt sur l'Île de la Tortue 🌴`
                );

            } catch (err) {
                console.log(
                    `Impossible d'envoyer un MP à ${newMember.user.tag}`
                );
            }

            console.log(
                `❌ Vérification refusée pour ${newMember.user.tag}`
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CAS NORMAL
        |--------------------------------------------------------------------------
        |
        | Le membre possède uniquement le rôle vérifié.
        |
        */

        if (hasVerified && !hasWrongRole) {

            if (newMember.roles.cache.has(UNVERIFIED_ROLE)) {

                await newMember.roles.remove(
                    UNVERIFIED_ROLE
                );

                console.log(
                    `✅ ${newMember.user.tag} vérifié`
                );
            }
        }

    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.TOKEN);
