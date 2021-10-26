import { isGuildBasedChannel, isThreadChannel } from "@sapphire/discord.js-utilities";
import { Nullish } from "@sapphire/utilities";
import { TextBasedChannels } from "discord.js";
export function isHasSendPerm(channel: TextBasedChannels | Nullish) {
    if (isThreadChannel(channel)) return channel.permissionsFor(channel.guild.me!).has("SEND_MESSAGES_IN_THREADS");
    else if (isGuildBasedChannel(channel)) return channel.permissionsFor(channel.guild.me!).has("SEND_MESSAGES");
}
