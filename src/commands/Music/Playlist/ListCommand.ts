import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";
import { isGuildBasedChannel, PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Chunk } from "../../../utils/Chunk";
import { joinArray } from "../../../utils/joinArray";
import { inlineCode } from "@discordjs/builders";
import { audioEmoji } from "../../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "list",
    description: "list saved playlist",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const getPlaylist = await this.container.client.databases.userPlaylists.getUserPlaylist(message.author.id);
        if (!getPlaylist.length) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} |You dont have any playlist.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const pages = Chunk(getPlaylist.map((x, i) => `\`${i + 1})\` ${x.playlistName} [${inlineCode(x.playlistId)}]`), 7);
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
