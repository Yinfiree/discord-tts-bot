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
        | SUPPRESSION AUTOMATIQUE DES MAUVAISES RÉPONSES
        |--------------------------------------------------------------------------
        */

        for (const roleId of WRONG_ROLES) {

            if (
                !oldMember.roles.cache.has(roleId) &&
                newMember.roles.cache.has(roleId)
            ) {

                setTimeout(async () => {
                    try {
                        const member = await newMember.guild.members.fetch(newMember.id);

                        if (member.roles.cache.has(roleId)) {
                            await member.roles.remove(roleId);

                            console.log(
                                `🗑️ Mauvaise réponse retirée à ${member.user.tag}`
                            );
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }, 30000); // 30 secondes
            }
        }

        /*
        |--------------------------------------------------------------------------
        | CAS TRICHE
        |--------------------------------------------------------------------------
        */

        if (hasVerified && hasWrongRole) {

            await newMember.roles.remove(VERIFIED_ROLE);

            if (!newMember.roles.cache.has(UNVERIFIED_ROLE)) {
                await newMember.roles.add(UNVERIFIED_ROLE);
            }

            try {

                await newMember.send(
`Bonjour voyageur,

Nous avons détecté que plusieurs réponses ont été sélectionnées lors de la vérification.

Pour accéder à l'Île de la Tortue, vous devez retrouver le mot caché dans la charte et sélectionner uniquement la bonne réponse.

Le rôle "Membre vérifié" vous a été retiré automatiquement.

📜 Merci de relire attentivement la charte puis de réessayer.

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
