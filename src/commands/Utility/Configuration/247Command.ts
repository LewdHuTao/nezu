import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";

@ApplyOptions<CommandOptions>({
    name: "247",
    description: "Let bot stay in voice",
    preconditions: ["threadCondition", "isQueueExist", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const getGuildDatabase = await this.container.client.databases.guilds.get(message.guildId!);
        const status = !getGuildDatabase.stayInVc;
        await this.container.client.databases.guilds.set(message.guildId!, "stayInVc", status);
        return message.channel.send({
            reply: {
                messageReference: message ?? null
            },
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | ${status ? "Enabled" : "Disabled"} 24/7`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
