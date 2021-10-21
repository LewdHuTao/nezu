import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "earrape",
    description: "Change current player filters to earrape",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        audio?.shoukakuPlayer.filters.timescale === null ? audio?.shoukakuPlayer.setEqualizer([...Array(6).fill(0).map((n, i) => ({ band: i, gain: 0.5 }))]) : audio?.shoukakuPlayer.setEqualizer([]);
        audio?.shoukakuPlayer.setVolume(500);

        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | ${audio?.shoukakuPlayer.filters.equalizer ? "Enabled" : "Disabled"} earrape filter`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
