import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "soft",
    description: "Change current player filters to soft",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        !audio?.shoukakuPlayer.filters.equalizer.length ? audio?.shoukakuPlayer.setLowPass({ smoothing: 20.0 }) : audio?.shoukakuPlayer.setLowPass(null);

        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | ${audio?.shoukakuPlayer.filters.lowPass ? "Enabled" : "Disabled"} soft filter`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
