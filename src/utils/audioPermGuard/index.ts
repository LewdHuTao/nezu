import { isGuildBasedChannel, isThreadChannel } from '@sapphire/discord.js-utilities';
import { Nullish } from '@sapphire/utilities';
import { TextBasedChannels } from 'discord.js';
export function isHasSendPerm(channel: TextBasedChannels | Nullish) {
    return isThreadChannel(channel) && channel.permissionsFor(channel.guild.me!).has("SEND_MESSAGES_IN_THREADS") || isGuildBasedChannel(channel) && channel.permissionsFor(channel.guild.me!).has("SEND_MESSAGES") 
} 