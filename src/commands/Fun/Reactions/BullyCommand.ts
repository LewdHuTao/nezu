import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import waifuPicsApi from "../../../utils/waifuPicsApi";

@ApplyOptions<CommandOptions>({
    name: "bully",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})
export class clientCommand extends Command {
    async messageRun(message: Message, args: Args) {
        const userArgument = (await args.pickResult("member")).value ?? message.member;
        const embed = new MessageEmbed()
            .setAuthor(userArgument?.id === message.author.id ? `How did you bully yourself?` : `${userArgument?.user.username} you got bullied by ${message.author.username}`, message.author.displayAvatarURL())
            .setImage((await waifuPicsApi.reactionImage("bully")).url)
            .setColor("LUMINOUS_VIVID_PINK");
        await message.channel.send({ embeds: [embed] });
    }
}
