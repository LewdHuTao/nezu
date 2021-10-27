import { ApplyOptions } from "@sapphire/decorators";
import { BaseGuildCommandInteraction, CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { SlashCommand, SlashCommandOptions } from "../../libs/slashies/SlashCommandPiece";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<SlashCommandOptions>({
    name: "skip",
    description: "Skip current playing track",
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
        audio.queueTrack.clear();
        audio.queueTrack.current = null;

        audio.shoukakuPlayer.stopTrack();
        return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} | Stopped current playing track and cleared the queue`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
