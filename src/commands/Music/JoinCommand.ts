import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";

@ApplyOptions<CommandOptions>({
    name: "join",
    description: "let bot join current user voice channel",
    preconditions: ["threadCondition", "onVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        await this.container.client.audioManager.handleJoin(message.member?.voice.channel!, message.channel as GuildTextBasedChannelTypes);
        await message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | Joined ${message.member?.voice.channel!.toString()} voice channel`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
