import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";
import { inlineCode } from "@discordjs/builders";
import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";

@ApplyOptions<CommandOptions>({
    name: "load",
    description: "load saved playlist and add to the queue",
    preconditions: ["threadCondition", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    options: ["id"]
})

export class clientCommand extends Command {
    async messageRun(message: Message, args: Args) {
        const playlistIdOrName = (await args.restResult("string")).value;
        if (!playlistIdOrName) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Please input valid playlistId/name.`)
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
                        .setDescription(`❌ | Could not find playlist with provided playlistId/name.`)
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
                        .setDescription(`❌ | Requested playlist is empty.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const audio = await this.container.client.audioManager.handleJoin(message.member?.voice.channel!, message.channel as GuildTextBasedChannelTypes);
        for (const track of getTrack) {
            track.track.requester = message.author;
            audio.queueTrack.add(track.track);
            continue;
        }
        if (audio?.queueTrack.totalSize === getTrack.length) await audio?.play();
        return message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | Added playlist ${inlineCode(getPlaylist.playlistName)} to the queue!`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
