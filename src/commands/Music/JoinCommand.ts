import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { isEligbleReply } from "../../utils/isEligbleReply";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "join",
    description: "let bot join current user voice channel",
    preconditions: ["threadCondition", "isCanConnect", "onVoiceCondition", "alreadyConnect"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        await this.container.client.audioManager.handleJoin(message.member?.voice.channel!, message.channel as GuildTextBasedChannelTypes);
        await message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} | Joined ${message.member?.voice.channel!.toString()} voice channel`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
