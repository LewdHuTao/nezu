import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";

@ApplyOptions<CommandOptions>({
    name: "avatar",
    description: "get user avatar",
    aliases: ["avi", "ava", "pfp"],
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY"]
})

export class clientCommand extends Command {
    async messageRun(message: Message, args: Args) {
        const user = this.container.client.users.resolve((await args.pickResult("member")).value!) ?? this.container.client.users.resolve(message.mentions.members?.filter(x => x.user !== this.container.client.user).first()!) ?? await this.container.client.users.fetch((await args.pickResult("string")).value!).catch(() => undefined!) ?? message.author;
        if (!user) {
            return message.channel.send({
                reply: {
                    messageReference: message ?? null
                },
                embeds: [
                    new MessageEmbed()
                        .setDescription(`⚠ | Please mention member / input user id`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const messageAttachment = new MessageAttachment(user.avatarURL({ size: 4096, dynamic: true })!);
        return message.channel.send({
            reply: {
                messageReference: message ?? null
            },
            files: [messageAttachment]
        });
    }
}
