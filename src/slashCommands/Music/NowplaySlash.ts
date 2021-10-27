import { inlineCode } from "@discordjs/builders";
import { ApplyOptions } from "@sapphire/decorators";
import { BaseGuildCommandInteraction, CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommand, SlashCommandOptions } from "../../libs/slashies/SlashCommandPiece";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<SlashCommandOptions>({
    name: "nowplay",
    description: "Get current playing track",
    defaultPermission: true
})
export class clientContext extends SlashCommand {
    public async messageRun(interaction: BaseGuildCommandInteraction<"present"> & CommandInteraction) {
        if (!interaction.replied && !interaction.deferred) await interaction.deferReply();
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
        if (!audio?.queueTrack.current) {
            return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | There are no playing track`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`🎧 | Playing track: ${inlineCode(audio.queueTrack.current.info.title!)}`)
                    .setFooter(`🎵 ${audio.shoukakuPlayer.filters.volume * 100}%`)
                    .setTimestamp()
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
