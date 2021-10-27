import { inlineCode } from "@discordjs/builders";
import { ApplyOptions } from "@sapphire/decorators";
import { BaseGuildCommandInteraction, CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { SlashCommand, SlashCommandOptions } from "../../libs/slashies/SlashCommandPiece";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<SlashCommandOptions>({
    name: "previous",
    description: "Play previous played track",
    defaultPermission: true
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
        const audio = this.container.client.audioManager.queue.get(interaction.guildId);
        if (!audio) {
            return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} There are no queue in this server`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }

        if (!audio?.queueTrack.previous) {
            return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`🚫 | Could not find previous playing track`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        audio.queueTrack.add(audio.queueTrack.previous);
        await audio.play(audio.queueTrack.previous.track);
        return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} | Playing previous track ${inlineCode(audio.queueTrack.previous.info.title!)}`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
