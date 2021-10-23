import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../utils/isEligbleReply";
import { audioEmoji } from "../../utils/Constants";
import { inlineCode } from "@discordjs/builders";

@ApplyOptions<CommandOptions>({
    name: "previous",
    description: "play previous played track",
    aliases: ["back"],
    preconditions: ["threadCondition", "isCanConnect", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        console.log(audio?.queueTrack.previous?.track);
        if (!audio?.queueTrack.previous?.track) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | Could not find previous played track`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        audio.queueTrack.add(audio.queueTrack.previous);
        await audio.play(audio.queueTrack.previous.track);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} | Playing previous track ${inlineCode(audio.queueTrack.previous.info.title!)}`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
