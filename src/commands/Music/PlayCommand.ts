import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<CommandOptions>({
    name: "play",
    aliases: ["p"],
    description: "let bot play best quality music audio",
    preconditions: ["threadCondition", "isCanConnect", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
})

export class clientCommand extends Command {
    
    async messageRun(message: Message, args: Args) {
        const userArgument = await args.restResult("string");
        if (!userArgument) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | You must input track name/url`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        const audio = await this.container.client.audioManager.handleJoin(message.member?.voice.channel!, message.channel as GuildTextBasedChannelTypes);
        const track = await this.container.client.audioManager.resolveTrack(userArgument.value!, { requester: message.author });
        if (!track || track.type === "LOAD_FAILED" || track.type === "NO_MATCHES") {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CROSS_MARK} | Could not find any results`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        }
        if (track.type === "PLAYLIST") {
            audio.queueTrack.add(track.tracks);
            await message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CHECK_MARK} | Added \`${track.playlistName}\` to the queue`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
            if (audio?.queueTrack.totalSize === track.tracks.length) return audio?.play();
        } else if (track.type === "TRACK" || track.type === "SEARCH") {
            await message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CHECK_MARK} | Added \`${track.tracks[0].info.title}\` to the queue`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
            audio.queueTrack.add(track.tracks[0]);
        }
        if (!audio?.shoukakuPlayer.paused && !audio?.queueTrack.size && !audio.playing) return audio?.play();
    }
}
