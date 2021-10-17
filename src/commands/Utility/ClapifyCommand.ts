import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import petitio from "petitio";
import { config } from "../../utils/parsedConfig";
import { jsonWeebyFormatText } from "../../types";

@ApplyOptions<CommandOptions>({
    name: "clapify",
    description: "clapify text or other user message",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY"]
})

export class clientCommand extends Command {
    async messageRun(message: Message, args: Args) {
        const argument = await args.restResult("string");
        if (!argument.success && !message.reference) {
            return message.channel.send({
                reply: {
                    messageReference: message ?? null
                },
                embeds: [
                    new MessageEmbed()
                        .setDescription(`⚠ | Please input text or message id to clapify`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const resolveMessage = message.channel.messages.cache.get(argument.value! ?? message.reference?.messageId)?.content ?? argument.value!;
        const resolvedClap = await this.resolveClapify(resolveMessage);
        if (!resolvedClap.output) {
            return message.channel.send({
                reply: {
                    messageReference: message ?? null
                },
                embeds: [
                    new MessageEmbed()
                        .setDescription(`⚠ | Please input text or message id to mock`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Clapify Message")
                    .setDescription(String(resolvedClap.output))
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }

    private async resolveClapify(text: string): Promise<jsonWeebyFormatText> {
        const JsonBrowser = await petitio("https://weebyapi.xyz/json/format").query({ text, type: "clapify", token: config.weebyToken }).json();
        return JsonBrowser;
    }
}
