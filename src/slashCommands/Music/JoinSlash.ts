import { ApplyOptions } from "@sapphire/decorators";
import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { BaseGuildCommandInteraction, CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { SlashCommand, SlashCommandOptions } from "../../libs/slashies/SlashCommandPiece";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<SlashCommandOptions>({
    name: "join",
    description: "Make bot join current member voice channel",
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
        await this.container.client.audioManager.handleJoin((interaction.member as GuildMember | null)?.voice.channel!, interaction.channel as GuildTextBasedChannelTypes);
        return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} | Joined ${(interaction.member as GuildMember | null)?.voice.channel!.toString()} voice channel`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
