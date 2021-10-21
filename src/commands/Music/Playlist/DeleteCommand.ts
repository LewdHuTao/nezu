import { Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";
import { inlineCode } from "@discordjs/builders";
import { SubCommandPluginCommand } from "@sapphire/plugin-subcommands";
@ApplyOptions<SubCommandPluginCommand.Options>({
    name: "delete",
    description: "Delete unwanted track in playlist",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    subCommands: ["track", "playlist", { input: "show", default: true }]
})

export class clientCommand extends SubCommandPluginCommand {
    async show(message: Message, args: Args) {
        return message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`❌ | Please input valid argument, example: ${args.commandContext.prefix}delete track 7c483fbf`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }

    async playlist(message: Message, args: Args) {
        const playlistId = (await args.pickResult("string")).value;
        if (!playlistId) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Please input valid playlistname/Id`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const playlist = await this.container.client.databases.userPlaylists.resolvePlaylist(message.author.id, playlistId);
        const playlistTrack = await this.container.client.databases.playlistTrack.getTrack(message.author.id, playlist?.playlistId!);
        for (const track of playlistTrack) {
            await this.container.client.databases.playlistTrack.delete(track.userId, track.trackId);
            continue;
        }
        await this.container.client.databases.userPlaylists.delete(message.author.id, playlistId);

        return message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | Deleted ${inlineCode(playlistId)} playlist`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }

    async track(message: Message, args: Args) {
        const trackId = (await args.pickResult("string")).value;
        if (!trackId) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Please input valid trackId`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const isTrackExist = await this.container.client.databases.playlistTrack.getSIngleTrack(message.author.id, trackId);
        if (!isTrackExist) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Track with id ${inlineCode(trackId)} does not exist.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        await this.container.client.databases.playlistTrack.delete(message.author.id, trackId);
        return message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | Deleted track with id ${inlineCode(trackId)}`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
