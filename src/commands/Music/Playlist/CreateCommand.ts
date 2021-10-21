import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { isEligbleReply } from "../../../utils/isEligbleReply";
import { inlineCode } from "@discordjs/builders";

@ApplyOptions<CommandOptions>({
    name: "create",
    description: "Create and save your own personal playlist",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message, args: Args) {
        const playlistName = (await args.restResult("string")).value;
        if (!playlistName || playlistName.length > 15 || !/^([a-zA-Z0-9 _-]+)$/.test(playlistName)) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Playlist name only can be number or letter, maximum length 15 characters.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const totalUserPlaylist = await this.container.client.databases.userPlaylists.getUserPlaylist(message.author.id);
        if (totalUserPlaylist.length > 4) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Sorry you only can create 5 playlist.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const isPlaylistExist = await this.container.client.databases.userPlaylists.resolvePlaylist(message.author.id, playlistName);
        if (isPlaylistExist) {
            return message.channel.send({
                reply: isEligbleReply(message),
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Sorry you cant create playlist with same name.`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const createdPlaylist = await this.container.client.databases.userPlaylists.createPlaylist(message.author.id, playlistName);
        return message.channel.send({
            reply: isEligbleReply(message),
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | Created playlist with name ${inlineCode(createdPlaylist.playlistName)}`)
                    .setFooter(`playlistId: ${createdPlaylist.playlistId}`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
    }
}
