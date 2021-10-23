import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isGuildBasedChannel, PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Chunk } from "../../utils/Chunk";
import { joinArray } from "../../utils/joinArray";
import { isEligbleReply } from "../../utils/isEligbleReply";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "queue",
    description: "Get server current queue",
    aliases: ["q"],
    preconditions: ["threadCondition", "isQueueExist"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const player = this.container.client.audioManager.queue.get(message.guildId!);
        if (!player?.queueTrack.size) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | Current queue is less than 1 track`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const pages = Chunk(player?.queueTrack.map((x, i) => `\`${i + 1})\` ${x.info.title} ${x.info.author ? `- ${x.info.author}` : ""} [${x.requester}]`), 7);
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
