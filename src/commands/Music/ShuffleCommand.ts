import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../utils/isEligbleReply";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "shuffle",
    description: "shuffle current server queue",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        this.container.client.audioManager.queue.get(message.guildId!)?.queueTrack.shuffle();
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.SHUFFLE} | Shuffled current server queue`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
