import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Constants, Message, MessageEmbed } from "discord.js";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
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
            actions: [
                {
                    customId: '@sapphire/paginated-messages.firstPage',
                    style: 'PRIMARY',
                    emoji: '⏪',
                    type: Constants.MessageComponentTypes.BUTTON,
                    run: ({ handler }) => (handler.index = 0)
                },
                {
                    customId: '@sapphire/paginated-messages.previousPage',
                    style: 'PRIMARY',
                    emoji: '◀️',
                    type: Constants.MessageComponentTypes.BUTTON,
                    run: ({ handler }) => {
                        if (handler.index === 0) handler.index = handler.pages.length - 1;
                        else --handler.index;
                    }
                },
                {
                    customId: '@sapphire/paginated-messages.nextPage',
                    style: 'PRIMARY',
                    emoji: '▶️',
                    type: Constants.MessageComponentTypes.BUTTON,
                    run: ({ handler }) => {
                        if (handler.index === handler.pages.length - 1) handler.index = 0;
                        else ++handler.index;
                    }
                },
                {
                    customId: '@sapphire/paginated-messages.goToLastPage',
                    style: 'PRIMARY',
                    emoji: '⏩',
                    type: Constants.MessageComponentTypes.BUTTON,
                    run: ({ handler }) => (handler.index = handler.pages.length - 1)
                },
                {
                    customId: '@sapphire/paginated-messages.stop',
                    style: 'DANGER',
                    emoji: '⏹️',
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
                embed.setDescription(joinArray(page))
                embed.setThumbnail(message.guild?.iconURL()!).setAuthor(message.guild?.name!, undefined, "https://nezukochan.tech")
                embed.setColor("LUMINOUS_VIVID_PINK");
                return embed;
            });
        }
        await PageMessage.run(message)
    }
}
