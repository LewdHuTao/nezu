import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import waifuPicsApi from "../../../utils/waifuPicsApi";

@ApplyOptions<CommandOptions>({
    name: "cuddle",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})
export class clientCommand extends Command {
    async messageRun(message: Message) {
        const embed = new MessageEmbed()
            .setImage(
                (await waifuPicsApi.reactionImage("cuddle")).url
            );
        await message.channel.send({ embeds: [embed] });
    }
}