import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "loop",
    description: "change current queue loop type",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message, args: Args) {
        const argument = await args.restResult("string");
        const audio = this.container.client.audioManager.queue.get(message.guildId!)!;
        switch (argument.value) {
            case "queue": {
                audio.queueLoop = !audio.queueLoop;
                audio.trackLoop = false;
                await message.channel.send({
                    reply: isEligbleReply(message),
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`🔁 ${audio.queueLoop ? "Enabled" : "Disabled"} queue loop`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ]
                });
                break;
            }
            case "track": {
                audio.trackLoop = !audio.trackLoop;
                audio.queueLoop = false;
                await message.channel.send({
                    reply: isEligbleReply(message),
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`🔂 ${audio.trackLoop ? "Enabled" : "Disabled"} track loop`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ]
                });
                break;
            }
            case "off": {
                audio.trackLoop = false;
                audio.queueLoop = false;
                await message.channel.send({
                    reply: isEligbleReply(message),
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`🔁 disabled loop`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ]
                });
                break;
            }
            default: {
                audio.queueLoop = !audio.queueLoop;
                await message.channel.send({
                    reply: isEligbleReply(message),
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`🔁 ${audio.queueLoop ? "Enabled" : "Disabled"} queue loop`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ]
                });
                break;
            }
        }
    }
}
