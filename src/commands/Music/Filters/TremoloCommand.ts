import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "vibrato",
    description: "Change current player filters to vibrato",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        audio?.shoukakuPlayer.filters.tremolo === null ? audio?.shoukakuPlayer.setTremolo({ frequency: 2.0, depth: 0.5 }) : audio?.shoukakuPlayer.setTremolo(null);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | ${audio?.shoukakuPlayer.filters.tremolo ? "Enabled" : "Disabled"} vibrato filter`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
