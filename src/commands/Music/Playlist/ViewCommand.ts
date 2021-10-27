import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Constants, Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Chunk } from "../../../utils/Chunk";
import { joinArray } from "../../../utils/joinArray";
import { inlineCode } from "@discordjs/builders";
import { audioEmoji } from "../../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "view",
    description: "view track in saved playlist",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message, args: Args) {
        const playlistIdOrName = (await args.restResult("string")).value;
        if (!playlistIdOrName) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | Please input valid playlistId/name.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const getPlaylist = await this.container.client.databases.userPlaylists.resolvePlaylist(message.author.id, playlistIdOrName);
        if (!getPlaylist) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | Could not find playlist with provided playlistId/name.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const getTrack = await this.container.client.databases.playlistTrack.getTrack(message.author.id, getPlaylist.playlistId);
        if (!getTrack.length) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | Requested playlist is empty.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const pages = Chunk(getTrack.map((x, i) => `\`${i + 1})\` ${x.track.info.title} ${x.track.info.author ? `- ${x.track.info.author}` : ""} [${inlineCode(x.trackId)}]`), 7);
        const PageMessage = new PaginatedMessage({
            actions: [
                {
                    customId: "@sapphire/paginated-messages.firstPage",
                    style: "PRIMARY",
                    emoji: "⏪",
                    type: Constants.MessageComponentTypes.BUTTON,
                    run: ({ handler }) => (handler.index = 0)
                },
                {
                    customId: "@sapphire/paginated-messages.previousPage",
                    style: "PRIMARY",
                    emoji: "◀️",
                    type: Constants.MessageComponentTypes.BUTTON,
                    run: ({ handler }) => {
                        if (handler.index === 0) handler.index = handler.pages.length - 1;
                        else --handler.index;
                    }
                },
                {
                    customId: "@sapphire/paginated-messages.nextPage",
                    style: "PRIMARY",
                    emoji: "▶️",
                    type: Constants.MessageComponentTypes.BUTTON,
                    run: ({ handler }) => {
                        if (handler.index === handler.pages.length - 1) handler.index = 0;
                        else ++handler.index;
                    }
                },
                {
                    customId: "@sapphire/paginated-messages.goToLastPage",
                    style: "PRIMARY",
                    emoji: "⏩",
                    type: Constants.MessageComponentTypes.BUTTON,
                    run: ({ handler }) => (handler.index = handler.pages.length - 1)
                },
                {
                    customId: "@sapphire/paginated-messages.stop",
                    style: "DANGER",
                    emoji: "⏹️",
                    type: Constants.MessageComponentTypes.BUTTON,
                    run: async ({ collector, response }) => {
                        collector.stop();
                        await response.edit({ components: [] });
                    }
                }
            ]
        });
        for (const page of pages) {
            PageMessage.addPageEmbed(embed => {
                embed.setDescription(joinArray(page));
                embed.setThumbnail(message.guild?.iconURL()!).setAuthor(message.guild?.name!, undefined, "https://nezukochan.tech");
                embed.setColor("LUMINOUS_VIVID_PINK");
                return embed;
            });
        }
        await PageMessage.run(message);
    }
}
