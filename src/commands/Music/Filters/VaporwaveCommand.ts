import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "vaporwave",
    description: "Change current player filters to vaporwave",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        if(!(audio?.shoukakuPlayer.filters.timescale && audio?.shoukakuPlayer.filters.tremolo && audio?.shoukakuPlayer.filters.equalizer)) {
            audio?.shoukakuPlayer.setTimescale({ speed: 1.0, rate: 1.0, pitch: 0.5 })
            audio?.shoukakuPlayer.setTremolo({ depth: 0.3, frequency: 14 })
            audio?.shoukakuPlayer.setEqualizer([{ band: 1, gain: 0.3 }, { band: 0, gain: 0.3 }])
        } else {
            audio?.shoukakuPlayer.setTimescale(null);
            audio?.shoukakuPlayer.setTremolo(null);
            audio?.shoukakuPlayer.setEqualizer([]);
        }    
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | ${audio?.shoukakuPlayer.filters.timescale && audio?.shoukakuPlayer.filters.tremolo && audio?.shoukakuPlayer.filters.equalizer ? "Enabled" : "Disabled"} vaporwave filter`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
