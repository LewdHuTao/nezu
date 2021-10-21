import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "pop",
    description: "Change current player filters to pop",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        !audio?.shoukakuPlayer.filters.equalizer.length ? audio?.shoukakuPlayer.setEqualizer([
            { band: 0, gain: 0.65 }, { band: 1, gain: 0.45 },
            { band: 2, gain: -0.45 }, { band: 3, gain: -0.65 },
            { band: 4, gain: -0.35 }, { band: 5, gain: 0.45 },
            { band: 6, gain: 0.55 }, { band: 7, gain: 0.6 },
            { band: 8, gain: 0.6 }, { band: 9, gain: 0.6 },
            { band: 10, gain: 0 }, { band: 11, gain: 0 },
            { band: 12, gain: 0 }, { band: 13, gain: 0 }
        ]) : audio?.shoukakuPlayer.setEqualizer([]);
        
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | ${audio?.shoukakuPlayer.filters.equalizer ? "Enabled" : "Disabled"} pop filter`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
