import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";
import { isGuildBasedChannel, PaginatedMessage } from "@sapphire/discord.js-utilities";
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
            template: new MessageEmbed().setThumbnail(message.guild?.iconURL()!).setAuthor(message.guild?.name!, undefined, "https://nezukochan.tech")
                .setColor("LUMINOUS_VIVID_PINK"),
            actions: [
                {
                    id: "⏪",
                    run: ({ handler }) => (handler.index = 0)
                },
                {
                    id: "◀️",
                    run: ({ handler }) => {
                        if (handler.index === 0) handler.index = handler.pages.length - 1;
                        else --handler.index;
                    }
                },
                {
                    id: "▶️",
                    run: ({ handler }) => {
                        if (handler.index === handler.pages.length - 1) handler.index = 0;
                        else ++handler.index;
                    }
                },
                {
                    id: "⏩",
                    run: ({ handler }) => (handler.index = handler.pages.length - 1)
                },
                {
                    id: "⏹️",
                    run: async ({ response, collector }) => {
                        if (
                            isGuildBasedChannel(response.channel) &&
                            response.client.user &&
                            response.channel.permissionsFor(response.client.user.id)?.has("MANAGE_MESSAGES")
                        ) {
                            await response.reactions.removeAll();
                        } else if (isGuildBasedChannel(response.channel) && response.client.user && !response.channel.permissionsFor(response.client.user.id)?.has("MANAGE_MESSAGES")) { return response.delete(); }
                        collector.stop();
                    }
                }
            ]
        });
        for (const page of pages) {
            PageMessage.addPageEmbed(embed => {
                embed.setDescription(joinArray(page));
                return embed;
            });
        }
        PageMessage.run(message).catch(() => null);
    }
}
