import { isGuildBasedChannel } from "@sapphire/discord.js-utilities";
import { Message, ReplyOptions } from "discord.js";

export function isEligbleReply(message: Message): ReplyOptions | undefined {
    return isGuildBasedChannel(message.channel) && message.channel.permissionsFor(message.guild?.me!).has(["READ_MESSAGE_HISTORY"]) ? { messageReference: message } : undefined;
}
