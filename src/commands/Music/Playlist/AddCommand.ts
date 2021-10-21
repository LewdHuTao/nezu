import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";
import { inlineCode } from "@discordjs/builders";

@ApplyOptions<CommandOptions>({
    name: "add",
    description: "Add track to saved playlist",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    options: ["id"]
})

export class clientCommand extends Command {
    async messageRun(message: Message, args: Args) {
        const playlistId = (await args.pickResult("string")).value;
        const trackQuery = (await args.restResult("string")).value;
        if (!playlistId) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Please input valid playlistId.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        if (!trackQuery) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Please input track name/url.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const getPlaylist = await this.container.client.databases.userPlaylists.resolvePlaylist(message.author.id, playlistId);
        if (!getPlaylist) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Could not find playlist with provided playlist id.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const shoukakuTrack = await this.container.client.audioManager.resolveTrack(trackQuery);
        if (!shoukakuTrack || shoukakuTrack.type === "NO_MATCHES" || shoukakuTrack.type === "LOAD_FAILED") {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Could not find any tracks.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const getTrack = await this.container.client.databases.playlistTrack.getTrack(getPlaylist.userId, getPlaylist.playlistId);
        if (getTrack && getTrack.length > 19) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Only 20 tracks allowed per playlist.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        if (shoukakuTrack.type === "PLAYLIST") {
            for (const track of shoukakuTrack.tracks) {
                await this.container.client.databases.playlistTrack.createTrack(getPlaylist.userId, getPlaylist.playlistId, track);
                continue;
            }
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`✅ | Added ${inlineCode(shoukakuTrack.playlistName!)} to the ${inlineCode(getPlaylist.playlistName)} playlist.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        await this.container.client.databases.playlistTrack.createTrack(getPlaylist.userId, getPlaylist.playlistId, shoukakuTrack.tracks[0]);
        return message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | Added ${inlineCode(shoukakuTrack.tracks[0].info.title!)} to the ${inlineCode(getPlaylist.playlistName)} playlist.`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
