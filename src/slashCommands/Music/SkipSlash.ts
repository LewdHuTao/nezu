import { ApplyOptions } from "@sapphire/decorators";
import { BaseGuildCommandInteraction, CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { SlashCommand, SlashCommandOptions } from "../../libs/slashies/SlashCommandPiece";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<SlashCommandOptions>({
    name: "skip",
    description: "Skip current playing track",
    defaultPermission: true,
    options: [
        {
            name: "track",
            required: false,
            description: "The track you want skipped to",
            type: ApplicationCommandOptionTypes.NUMBER
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
        const amount = interaction.options.getNumber("track", false);
        if (amount && typeof amount === "number" && amount > 1) {
            if (amount > audio.queueTrack.length) throw new RangeError("Cannot skip more than the queue length.");
            audio.queueTrack.splice(0, amount - 1);
        }

        audio.shoukakuPlayer.stopTrack();
        return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} Skipped playing track`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
