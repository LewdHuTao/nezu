import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../utils/isEligbleReply";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "pause",
    description: "pause current playing track",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        this.container.client.audioManager.queue.get(message.guildId!)?.shoukakuPlayer.setPaused(true);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.PAUSE} | Paused current playing track`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
