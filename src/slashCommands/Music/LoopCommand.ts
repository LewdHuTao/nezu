import { ApplyOptions } from "@sapphire/decorators";
import { BaseGuildCommandInteraction, CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { SlashCommand, SlashCommandOptions } from "../../libs/slashies/SlashCommandPiece";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<SlashCommandOptions>({
    name: "loop",
    description: "Loop current track or queue",
    defaultPermission: true,
    options: [
        {
            name: "type",
            description: "The loop type that will applied",
            type: ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: "queue",
                    value: "queue"
                },
                {
                    name: "track",
                    value: "track"
                },
                {
                    name: "off",
                    value: "off"
                }
            ]
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
        const loopType = interaction.options.getString("type", true);
        switch (loopType) {
            case "queue": {
                audio.queueLoop = !audio.queueLoop;
                audio.trackLoop = false;
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`${audioEmoji.REPEAT} ${audio.queueLoop ? "Enabled" : "Disabled"} queue loop`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ]
                });
                break;
            }
            case "track": {
                audio.trackLoop = !audio.trackLoop;
                audio.queueLoop = false;
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`${audioEmoji.REPEAT_TRACK} ${audio.trackLoop ? "Enabled" : "Disabled"} track loop`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ]
                });
                break;
            }
            case "off": {
                audio.trackLoop = false;
                audio.queueLoop = false;
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`${audioEmoji.REPEAT} disabled loop`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ]
                });
                break;
            }
            default: {
                audio.queueLoop = !audio.queueLoop;
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`${audioEmoji.REPEAT} ${audio.queueLoop ? "Enabled" : "Disabled"} queue loop`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ]
                });
                break;
            }
        }
    }
}
