import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../utils/isEligbleReply";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "disconnect",
    description: "stop and disconnect bot from the voice",
    aliases: ["dc"],
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        this.container.client.audioManager.queue.get(message.guildId!)?.shoukakuPlayer.connection.disconnect();
        this.container.client.audioManager.queue.delete(message.guildId!);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} | Disconnected from ${message.member?.voice.channel!.toString()} voice channel`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
