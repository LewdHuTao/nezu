import { inlineCode } from "@discordjs/builders";
import { ApplyOptions } from "@sapphire/decorators";
import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { BaseGuildCommandInteraction, CommandInteraction, GuildMember, Message, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import ms from "ms";
import { SlashCommand, SlashCommandOptions } from "../../libs/slashies/SlashCommandPiece";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<SlashCommandOptions>({
    name: "search",
    description: "Search and play music in your voice channel",
    defaultPermission: true,
    options: [
        {
            name: "query",
            required: true,
            description: "The track you want to play",
            type: ApplicationCommandOptionTypes.STRING
        }
    ]
})
export class clientContext extends SlashCommand {
    public async messageRun(interaction: BaseGuildCommandInteraction<"present"> & CommandInteraction) {
        if (!interaction.replied && !interaction.deferred) await interaction.deferReply();
        if (!(interaction.member as GuildMember | null)?.voice.channelId || (interaction.guild?.me?.voice.channelId && (interaction.member as GuildMember | null)?.voice.channelId !== interaction.guild?.me?.voice.channelId)) {
            return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} You must be on same voice channel to do this`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const userArgument = interaction.options.getString("query", true);
        const audio = await this.container.client.audioManager.handleJoin((interaction.member as GuildMember | null)?.voice.channel!, interaction.channel as GuildTextBasedChannelTypes);
        if (!userArgument) {
            return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | You must input track name/url`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const track = await this.container.client.audioManager.resolveTrack(userArgument, { requester: interaction.user });

        if (!track || track.type === "LOAD_FAILED" || track.type === "NO_MATCHES") {
            return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | Could not find any results`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        if (track.type === "PLAYLIST") {
            audio.queueTrack.add(track.tracks);
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CHECK_MARK} | Added \`${track.playlistName}\` to the queue`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
            if (audio?.queueTrack.totalSize === track.tracks.length) return audio?.play();
        } else if (track.type === "TRACK") {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CHECK_MARK} | Added \`${track.tracks[0].info.title}\` to the queue`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
            audio.queueTrack.add(track.tracks[0]);
        } else if (track.type === "SEARCH") {
            const row = new MessageActionRow();
            const selectMenu = new MessageSelectMenu().setCustomId("musicSelection");
            let currentCount = 0;
            for (const slicedTrack of track.tracks.slice(0, 10)) {
                selectMenu.addOptions({
                    label: slicedTrack.info.title!.length > 98 ? `${slicedTrack.info.title!.substr(0, 97)}...` : slicedTrack.info.title!,
                    value: String(currentCount++),
                    description: `${slicedTrack.info.author} - ${ms(slicedTrack.info.length!)}`
                });
            }
            row.addComponents(selectMenu);
            const collectMessage = await interaction.editReply({
                components: [row],
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CHECK_MARK} | Select music between 1-10, you have 20 seconds to decide.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            }) as Message;
            const collector = collectMessage.createMessageComponentCollector({
                filter: componentInteraction => componentInteraction.user.id === interaction.user.id,
                time: 20000
            });
            collector.on("collect", async interaction => {
                if (!interaction.isSelectMenu()) return;
                if (interaction.customId !== "musicSelection") return;
                await interaction.deferUpdate();
                const musicTrack = track.tracks[parseInt(interaction.values[0])];
                audio.queueTrack.add(musicTrack);
                if (!audio.playing && !audio.shoukakuPlayer.paused && !audio.queueTrack.size) {
                    await audio.play();
                }
                await collectMessage.edit({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`${audioEmoji.CHECK_MARK} Added ${inlineCode(musicTrack.info.title!)} to the queue`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ],
                    components: []
                });
                return collector.stop("selected");
            });
            collector.on("end", async (_, reason) => {
                if (reason !== "selected") {
                    await collectMessage.edit({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`${audioEmoji.CROSS_MARK} | You didnt select requested track, track selection canceled`)
                                .setColor("LUMINOUS_VIVID_PINK")
                        ],
                        components: []
                    });
                }
            });
        }
    }
}
