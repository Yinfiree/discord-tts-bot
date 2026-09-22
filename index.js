require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
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

// Nouveau membre qui vient d'arriver
const NEW_ARRIVANT_ROLE = '1541942046770593902';

// Membre accepté par le staff mais pas encore vérifié
const NON_VERIFIE_ROLE = '1514673663562088621';

// Rôle indiquant que la candidature staff a été acceptée
const ACCEPTED_ROLE = '1541934131208917163';

const WRONG_ROLES = [
    '1514826951653855464',
    '1514827644384968814',
    '1514827820042551386'
];

/*
|--------------------------------------------------------------------------
| SALONS DES CANDIDATURES
|--------------------------------------------------------------------------
*/

const APPLICATION_CHANNEL = '1541929544569847868';
const STAFF_APPLICATION_CHANNEL = '1541857058213859358';

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

client.once('clientReady', async () => {

    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    try {

        const channel = await client.channels.fetch(
            APPLICATION_CHANNEL
        );

        if (!channel) {
            console.log('❌ Salon Candidature introuvable.');
            return;
        }

        // Vérifie si le panneau existe déjà
        const messages = await channel.messages.fetch({
            limit: 50
        });

        const alreadyExists = messages.some(message =>
            message.components.some(row =>
                row.components.some(component =>
                    component.customId === 'application_start'
                )
            )
        );

        if (alreadyExists) {
            console.log('ℹ️ Le bouton Postuler existe déjà.');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('📩 Candidature membre')
            .setDescription(
                'Tu souhaites rejoindre les membres de l’île ?\n\n' +
                'Clique sur le bouton ci-dessous pour déposer ta candidature.'
            );

        const button = new ButtonBuilder()
            .setCustomId('application_start')
            .setLabel('📩 Postuler')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        console.log('✅ Panneau de candidature installé.');

    } catch (error) {

        console.error(
            '❌ Erreur lors de l’installation du panneau :',
            error
        );
    }
});

/*
|--------------------------------------------------------------------------
| NOUVEAU MEMBRE
|--------------------------------------------------------------------------
*/

client.on('guildMemberAdd', async (member) => {

    try {

        // Nouveau membre = Nouveau arrivant
        if (!member.roles.cache.has(NEW_ARRIVANT_ROLE)) {

            await member.roles.add(NEW_ARRIVANT_ROLE);

            console.log(
                `👋 ${member.user.tag} reçoit le rôle Nouveau arrivant`
            );
        }

    } catch (error) {

        console.error(
            `❌ Impossible de donner Nouveau arrivant à ${member.user.tag}`,
            error
        );
    }
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
| TOUJOURS AVOIR NON VÉRIFIÉ SI PAS MEMBRE VÉRIFIÉ
|--------------------------------------------------------------------------
*/

if (
    !newMember.roles.cache.has(VERIFIED_ROLE) &&
    !newMember.roles.cache.has(UNVERIFIED_ROLE)
) {

    await newMember.roles.add(UNVERIFIED_ROLE);

    console.log(
        `↩️ ${newMember.user.tag} redevient non vérifié`
    );

    return;
}
        
        /*
        |--------------------------------------------------------------------------
        | CAS NORMAL
        |--------------------------------------------------------------------------
        */

        if (hasVerified && !hasWrongRole) {

    // Retire Nouveau arrivant
    if (newMember.roles.cache.has(UNVERIFIED_ROLE)) {

        await newMember.roles.remove(
            UNVERIFIED_ROLE
        );

        console.log(
            `🗑️ Nouveau arrivant retiré à ${newMember.user.tag}`
        );
    }


    // Retire Membre accepter
    if (newMember.roles.cache.has(ACCEPTED_ROLE)) {

        await newMember.roles.remove(
            ACCEPTED_ROLE
        );

        console.log(
            `🗑️ Membre accepter retiré à ${newMember.user.tag}`
        );
    }


    console.log(
        `✅ ${newMember.user.tag} vérifié`
    );
}

    } catch (error) {
        console.error(error);
    }
});

/*
|--------------------------------------------------------------------------
| SYSTÈME DE CANDIDATURE
|--------------------------------------------------------------------------
*/

client.on('interactionCreate', async (interaction) => {

    try {

        /*
        |--------------------------------------------------------------------------
        | BOUTON POSTULER
        |--------------------------------------------------------------------------
        */

        if (
            interaction.isButton() &&
            interaction.customId === 'application_start'
        ) {

            const modal = new ModalBuilder()
                .setCustomId('application_modal')
                .setTitle('📩 Candidature membre');


            // Question 1
            const ageInput = new TextInputBuilder()
                .setCustomId('application_age')
                .setLabel('Quel âge as-tu ?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(3);


            // Question 2
            const motivationInput = new TextInputBuilder()
                .setCustomId('application_motivation')
                .setLabel('Pourquoi veux-tu rejoindre le serveur ?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(1000);


            // Question 3
            const experienceInput = new TextInputBuilder()
                .setCustomId('application_experience')
                .setLabel('As-tu déjà joué à ce type de serveur ?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(1000);


            // Question 4
            const availabilityInput = new TextInputBuilder()
                .setCustomId('application_availability')
                .setLabel('Quelles sont tes disponibilités ?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(1000);


            // Question 5
            const presentationInput = new TextInputBuilder()
                .setCustomId('application_presentation')
                .setLabel('Présente-toi rapidement')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(1000);


            modal.addComponents(
                new ActionRowBuilder().addComponents(ageInput),
                new ActionRowBuilder().addComponents(motivationInput),
                new ActionRowBuilder().addComponents(experienceInput),
                new ActionRowBuilder().addComponents(availabilityInput),
                new ActionRowBuilder().addComponents(presentationInput)
            );


            await interaction.showModal(modal);

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | ENVOI DU FORMULAIRE
        |--------------------------------------------------------------------------
        */

        if (
            interaction.isModalSubmit() &&
            interaction.customId === 'application_modal'
        ) {

            const age =
                interaction.fields.getTextInputValue(
                    'application_age'
                );

            const motivation =
                interaction.fields.getTextInputValue(
                    'application_motivation'
                );

            const experience =
                interaction.fields.getTextInputValue(
                    'application_experience'
                );

            const availability =
                interaction.fields.getTextInputValue(
                    'application_availability'
                );

            const presentation =
                interaction.fields.getTextInputValue(
                    'application_presentation'
                );


            const staffChannel =
                await interaction.guild.channels.fetch(
                    STAFF_APPLICATION_CHANNEL
                );


            if (!staffChannel) {

                await interaction.reply({
                    content:
                        '❌ Le salon des candidatures est introuvable.',
                    ephemeral: true
                });

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | EMBED DE LA CANDIDATURE
            |--------------------------------------------------------------------------
            */

            const embed = new EmbedBuilder()
                .setTitle('📩 Nouvelle candidature')
                .setDescription(
                    `Candidature de ${interaction.user}`
                )
                .addFields(

                    {
                        name: '👤 Candidat',
                        value:
                            `${interaction.user}\n` +
                            `ID : ${interaction.user.id}`
                    },

                    {
                        name: '🎂 Âge',
                        value: age
                    },

                    {
                        name: '💬 Motivation',
                        value: motivation
                    },

                    {
                        name: '🎮 Expérience',
                        value: experience
                    },

                    {
                        name: '🕐 Disponibilités',
                        value: availability
                    },

                    {
                        name: '🙋 Présentation',
                        value: presentation
                    }
                )
                .setFooter({
                    text:
                        `ID candidat : ${interaction.user.id}`
                });


            /*
            |--------------------------------------------------------------------------
            | BOUTONS STAFF
            |--------------------------------------------------------------------------
            */

            const acceptButton = new ButtonBuilder()
                .setCustomId(
                    `application_accept_${interaction.user.id}`
                )
                .setLabel('✅ Accepter')
                .setStyle(ButtonStyle.Success);


            const refuseButton = new ButtonBuilder()
                .setCustomId(
                    `application_refuse_${interaction.user.id}`
                )
                .setLabel('❌ Refuser')
                .setStyle(ButtonStyle.Danger);


            const buttons = new ActionRowBuilder()
                .addComponents(
                    acceptButton,
                    refuseButton
                );


            await staffChannel.send({
                embeds: [embed],
                components: [buttons]
            });


            await interaction.reply({
                content:
                    '✅ Ta candidature a bien été envoyée au staff !',
                ephemeral: true
            });

            console.log(
                `📩 Nouvelle candidature de ${interaction.user.tag}`
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | ACCEPTATION / REFUS STAFF
        |--------------------------------------------------------------------------
        */

        if (
            interaction.isButton() &&
            (
                interaction.customId.startsWith(
                    'application_accept_'
                ) ||
                interaction.customId.startsWith(
                    'application_refuse_'
                )
            )
        ) {

            /*
            |--------------------------------------------------------------------------
            | VÉRIFICATION DU STAFF
            |--------------------------------------------------------------------------
            */

            const isStaff =
                STAFF_ROLES.some(role =>
                    interaction.member.roles.cache.has(role)
                );


            if (!isStaff) {

                await interaction.reply({
                    content:
                        '❌ Tu n’as pas la permission de gérer les candidatures.',
                    ephemeral: true
                });

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | RÉCUPÉRATION DU CANDIDAT
            |--------------------------------------------------------------------------
            */

            const parts =
                interaction.customId.split('_');

            const action = parts[1];

            const userId = parts[2];


            const member =
                await interaction.guild.members
                    .fetch(userId)
                    .catch(() => null);


            if (!member) {

                await interaction.reply({
                    content:
                        '❌ Impossible de retrouver ce membre.',
                    ephemeral: true
                });

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | ACCEPTATION
            |--------------------------------------------------------------------------
            */

            if (action === 'accept') {

                // Le staff accepte la candidature
await member.roles.add(ACCEPTED_ROLE);

// Il n'est plus un nouveau arrivant
if (member.roles.cache.has(NEW_ARRIVANT_ROLE)) {

    await member.roles.remove(
        NEW_ARRIVANT_ROLE
    );
}

// Il devient "Non vérifié"
// Il pourra maintenant accéder à la charte
if (!member.roles.cache.has(NON_VERIFIE_ROLE)) {

    await member.roles.add(
        NON_VERIFIE_ROLE
    );
}

                const updatedEmbed =
                    EmbedBuilder.from(
                        interaction.message.embeds[0]
                    )
                    .setTitle('✅ Candidature acceptée');


                await interaction.message.edit({
                    embeds: [updatedEmbed],
                    components: []
                });


                try {

                    await member.send(
`🎉 Félicitations !

Ta candidature pour rejoindre les membres de l’île a été acceptée.

Tu peux maintenant accéder aux espaces réservés aux membres.

🌴 Bienvenue sur l’île de la Tortue !`
                    );

                } catch (error) {

                    console.log(
                        `⚠️ Impossible d'envoyer un MP à ${member.user.tag}`
                    );
                }


                await interaction.reply({
                    content:
                        `✅ ${member.user.tag} a été accepté.`,
                    ephemeral: true
                });


                console.log(
                    `✅ Candidature acceptée : ${member.user.tag}`
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | REFUS
            |--------------------------------------------------------------------------
            */

            if (action === 'refuse') {

                const updatedEmbed =
                    EmbedBuilder.from(
                        interaction.message.embeds[0]
                    )
                    .setTitle('❌ Candidature refusée');


                await interaction.message.edit({
                    embeds: [updatedEmbed],
                    components: []
                });


                try {

                    await member.send(
`❌ Ta candidature n’a pas été retenue.

Tu pourras éventuellement retenter ta chance plus tard.`
                    );

                } catch (error) {

                    console.log(
                        `⚠️ Impossible d'envoyer un MP à ${member.user.tag}`
                    );
                }


                await interaction.reply({
                    content:
                        `❌ ${member.user.tag} a été refusé.`,
                    ephemeral: true
                });


                console.log(
                    `❌ Candidature refusée : ${member.user.tag}`
                );

                return;
            }
        }

    } catch (error) {

        console.error(
            '❌ Erreur dans le système de candidature :',
            error
        );

        if (!interaction.replied && !interaction.deferred) {

            await interaction.reply({
                content:
                    '❌ Une erreur est survenue. Merci de contacter le staff.',
                ephemeral: true
            }).catch(() => {});
        }
    }
});

client.login(process.env.TOKEN);
