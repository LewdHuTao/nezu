import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";
import { audioEmoji } from "../../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "karaoke",
    description: "Change current player filters to karaoke",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const audio = this.container.client.audioManager.queue.get(message.guildId!);
        audio?.filters.setKaraoke(!audio.filters.status.karaoke);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} | ${audio?.filters.status.karaoke ? "Enabled" : "Disabled"} karaoke filter`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
