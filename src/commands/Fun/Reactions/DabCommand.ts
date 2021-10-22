import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import petitio from "petitio";
import { config } from "../../../utils/parsedConfig";

@ApplyOptions<CommandOptions>({
    name: "dab",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})
export class clientCommand extends Command {
    async messageRun(message: Message) {
        const embed = new MessageEmbed()
            .setImage((await this.weebyManager("dab")).url)
            .setColor("LUMINOUS_VIVID_PINK");
        await message.channel.send({ embeds: [embed] });
    }

    public async weebyManager(imageType: string): Promise<weebyGif> {
        const baseURI = "https://weebyapi.xyz";
        const image = await petitio(`${baseURI}/gif/${imageType}`)
            .header({ Authorization: `Bearer ${config.weebyToken}` })
            .json();
        return image;
    }
}

interface weebyGif {
    url: string;
}
