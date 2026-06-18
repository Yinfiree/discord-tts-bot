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

/*
|--------------------------------------------------------------------------
| RÔLES SÉPARATEURS
|--------------------------------------------------------------------------
*/

const STAFF_SEPARATOR_ROLE = '1508463881172029490';
const PROFILS_ROLE = '1508465500445737000';
const NOTIFICATIONS_ROLE = '1508466165662355556';

/*
|--------------------------------------------------------------------------
| RÔLES STAFF
|--------------------------------------------------------------------------
*/

const STAFF_ROLES = [
    '1500497671209877655',
    '1504153060178530335'
];

/*
|--------------------------------------------------------------------------
| RÔLES PROFILS
|--------------------------------------------------------------------------
*/

const PROFILE_ROLES = [
    '1508121548534448138',
    '1508122530131480797',
    '1508122731189633155',
    '1508122890304880781',
    '1508123032076419303',
    '1508123202667286629',

    '1508124726122250290',
    '1508124887565205515',
    '1508124979047174195',

    '1508123886951202826',
    '1508124228246044752',
    '1508124348639215686',

    '1508129165742968954',
    '1508129425307209771',
    '1508130384997781654',
    '1508135328182173777',
    '1508135427771601036',
    '1508136585076543630',
    '1508136737992609792'
];

/*
|--------------------------------------------------------------------------
| RÔLES NOTIFICATIONS
|--------------------------------------------------------------------------
*/

const NOTIFICATION_ROLES = [
    '1508126554536939530',
    '1508127027205636280',
    '1508127342122373171'
];

client.once('clientReady', () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {

    try {

/*
|--------------------------------------------------------------------------
| RÔLES SÉPARATEURS AUTOMATIQUES
|--------------------------------------------------------------------------
*/

// ---------- PROFILS ----------

const hasProfileRole =
    PROFILE_ROLES.some(role =>
        newMember.roles.cache.has(role)
    );

if (
    hasProfileRole &&
    !newMember.roles.cache.has(PROFILS_ROLE)
) {

    await newMember.roles.add(PROFILS_ROLE);
}

if (
    !hasProfileRole &&
    newMember.roles.cache.has(PROFILS_ROLE)
) {

    await newMember.roles.remove(PROFILS_ROLE);
}

// ---------- NOTIFICATIONS ----------

const hasNotificationRole =
    NOTIFICATION_ROLES.some(role =>
        newMember.roles.cache.has(role)
    );

if (
    hasNotificationRole &&
    !newMember.roles.cache.has(NOTIFICATIONS_ROLE)
) {

    await newMember.roles.add(NOTIFICATIONS_ROLE);
}

if (
    !hasNotificationRole &&
    newMember.roles.cache.has(NOTIFICATIONS_ROLE)
) {

    await newMember.roles.remove(NOTIFICATIONS_ROLE);
}

// ---------- STAFF ----------

const hasStaffRole =
    STAFF_ROLES.some(role =>
        newMember.roles.cache.has(role)
    );

if (
    hasStaffRole &&
    !newMember.roles.cache.has(STAFF_SEPARATOR_ROLE)
) {

    await newMember.roles.add(STAFF_SEPARATOR_ROLE);
}

if (
    !hasStaffRole &&
    newMember.roles.cache.has(STAFF_SEPARATOR_ROLE)
) {

    await newMember.roles.remove(STAFF_SEPARATOR_ROLE);
}
        
        const hasVerified =
            newMember.roles.cache.has(VERIFIED_ROLE);

        const hasWrongRole =
            WRONG_ROLES.some(role =>
                newMember.roles.cache.has(role)
            );

        /*
|--------------------------------------------------------------------------
| GESTION DES MAUVAISES RÉPONSES
|--------------------------------------------------------------------------
*/

for (const roleId of WRONG_ROLES) {

    if (
        !oldMember.roles.cache.has(roleId) &&
        newMember.roles.cache.has(roleId)
    ) {

        // S'assure qu'il reste non vérifié
        if (!newMember.roles.cache.has(UNVERIFIED_ROLE)) {
            await newMember.roles.add(UNVERIFIED_ROLE);
        }

        // Si le membre n'est PAS vérifié, on lui envoie un MP d'erreur
        if (!newMember.roles.cache.has(VERIFIED_ROLE)) {

            try {

                await newMember.send(
`🐢 Oups !

La réponse sélectionnée n'est pas correcte.

Merci de relire attentivement la charte afin de retrouver le mot caché puis de réessayer.

Votre accès à l'île de la Tortue reste en attente de vérification.`
                );

            } catch (err) {
                console.log(
                    `Impossible d'envoyer un MP à ${newMember.user.tag}`
                );
            }
        }

        // Suppression automatique après 30 secondes
        setTimeout(async () => {

            try {

                const member =
                    await newMember.guild.members.fetch(
                        newMember.id
                    );

                if (member.roles.cache.has(roleId)) {

                    await member.roles.remove(roleId);

                    console.log(
                        `🗑️ Mauvaise réponse retirée à ${member.user.tag}`
                    );
                }

            } catch (err) {
                console.error(err);
            }

        }, 30000);
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
`🐢 Bonjour voyageur,

Nous avons détecté que plusieurs réponses ont été sélectionnées lors de la vérification.

Pour accéder à l'île , vous devez retrouver le mot caché dans la charte et sélectionner uniquement la bonne réponse.

Le rôle "Membre vérifié" vous a été retiré automatiquement.

📜 Merci de relire attentivement la charte puis de réessayer.

À bientôt sur l'île de la Tortue 🌴`
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
| SI LE MEMBRE RETIRE LE ROLE MEMBRE VÉRIFIÉ
|--------------------------------------------------------------------------
*/

if (
    oldMember.roles.cache.has(VERIFIED_ROLE) &&
    !newMember.roles.cache.has(VERIFIED_ROLE)
) {

    // On lui remet le rôle Non vérifié
    if (!newMember.roles.cache.has(UNVERIFIED_ROLE)) {

        await newMember.roles.add(UNVERIFIED_ROLE);

        console.log(
            `↩️ ${newMember.user.tag} a perdu le rôle vérifié et redevient non vérifié`
        );
    }
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
