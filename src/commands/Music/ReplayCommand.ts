import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../utils/isEligbleReply";
import { inlineCode } from "@discordjs/builders";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "replay",
    description: "replay current played track",
    preconditions: ["threadCondition", "isCanConnect", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
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
                        .setDescription(`🚫 | Could not find current playing track`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        audio.shoukakuPlayer.seekTo(0);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} | Replayed current track ${inlineCode(audio.queueTrack.current.info.title!)}`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
