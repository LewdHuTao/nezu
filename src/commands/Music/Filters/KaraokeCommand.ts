import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";

@ApplyOptions<CommandOptions>({
    name: "karaoke",
    description: "Change current player filters to karaoke",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        audio?.shoukakuPlayer.filters.karaoke === null ? audio?.shoukakuPlayer.setKaraoke({ level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 }) : audio?.shoukakuPlayer.setKaraoke(null);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | ${audio?.shoukakuPlayer.filters.karaoke ? "Enabled" : "Disabled"} karaoke filter`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
