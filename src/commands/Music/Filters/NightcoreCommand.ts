import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "nightcore",
    description: "Change current player filters to nightcore",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        audio?.shoukakuPlayer.filters.timescale === null ? audio?.shoukakuPlayer.setTimescale({ speed: 1.0, pitch: 1.2 }) : audio?.shoukakuPlayer.setTimescale(null);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | ${audio?.shoukakuPlayer.filters.timescale ? "Enabled" : "Disabled"} nightcore filter`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
