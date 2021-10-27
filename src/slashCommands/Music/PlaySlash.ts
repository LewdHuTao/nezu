import { ApplyOptions } from "@sapphire/decorators";
import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { BaseGuildCommandInteraction, CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { SlashCommand, SlashCommandOptions } from "../../libs/slashies/SlashCommandPiece";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<SlashCommandOptions>({
    name: "play",
    description: "Play music in your voice channel",
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
        } else if (track.type === "TRACK" || track.type === "SEARCH") {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CHECK_MARK} | Added \`${track.tracks[0].info.title}\` to the queue`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
            audio.queueTrack.add(track.tracks[0]);
        }
        if (!audio?.shoukakuPlayer.paused && !audio?.queueTrack.size && !audio.playing) return audio?.play();
    }
}
