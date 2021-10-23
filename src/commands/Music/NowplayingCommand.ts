import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../utils/isEligbleReply";
import { inlineCode } from "@discordjs/builders";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "nowplaying",
    description: "Get current playing track",
    aliases: ["np", "current", "nowplay"],
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        if (!audio?.queueTrack.current) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | There are no playing track`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        await message.channel.send({
            reply: isEligbleReply(message),
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
