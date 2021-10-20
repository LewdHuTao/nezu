import { CommandDeniedPayload, Events, Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { red, magentaBright } from "colorette";
import { MessageEmbed } from "discord.js";
import { isGuildBasedChannel } from "@sapphire/discord.js-utilities";

@ApplyOptions<ListenerOptions>({
    name: Events.CommandDenied
})
export class clientListener extends Listener {
    async run(error: Error, context: CommandDeniedPayload) {
        if (isGuildBasedChannel(context.message.channel) && context.message.channel.isThread() && !context.message.channel.permissionsFor(context.message.guild?.me!).has(["SEND_MESSAGES_IN_THREADS"] || !context.message.channel.permissionsFor(context.message.guild?.me!).has(["EMBED_LINKS"]))) {
            return context.message.author.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor("Support Server [CLICK]", undefined, "https://discord.gg/b47d4AqxFR")
                        .setDescription(`I dont have permissions send message in threads and embed in ${context.message.channel.name}`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        if (isGuildBasedChannel(context.message.channel) && !context.message.channel.permissionsFor(context.message.guild?.me!).has(["SEND_MESSAGES"] || !context.message.channel.permissionsFor(context.message.guild?.me!).has(["EMBED_LINKS"]))) {
            return context.message.author.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor("Support Server [CLICK]", undefined, "https://discord.gg/b47d4AqxFR")
                        .setDescription(`I dont have permissions send message and embed in ${context.message.channel.name}`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        await context.message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setAuthor("Support Server [CLICK]", undefined, "https://discord.gg/b47d4AqxFR")
                    .setDescription(String(error.message))
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
        this.container.client.logger.info(`${red("[Client]")} ${magentaBright(`caught an error: ${error.message}, command: ${context.command.name}`)}`);
    }
}
