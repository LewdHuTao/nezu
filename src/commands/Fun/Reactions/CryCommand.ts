import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import waifuPicsApi from "../../../utils/waifuPicsApi";

@ApplyOptions<CommandOptions>({
    name: "cry",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})
export class clientCommand extends Command {
    async messageRun(message: Message) {
        const embed = new MessageEmbed()
            .setImage(
                (await waifuPicsApi.reactionImage("cry")).url
            );
        await message.channel.send({ embeds: [embed] });
    }
}
