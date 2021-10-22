import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "replay",
    description: "replay current played track",
    preconditions: ["threadCondition", "isCanConnect", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        if (!audio?.queueTrack.current) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`🚫 | Could not find current played track`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        await audio.play(audio.queueTrack.current.track);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | Replayed current track ${audio.queueTrack.current.info.title}`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
