import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "stop",
    description: "stop current playing track and clear the queue",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        this.container.client.audioManager.queue.get(message.guildId!)?.shoukakuPlayer.stopTrack();
        this.container.client.audioManager.queue.get(message.guildId!)?.queueTrack.clear();
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | Stopped current playing track and cleared the queue`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
