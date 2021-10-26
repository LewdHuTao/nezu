import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright, yellow } from "colorette";
import { Client, MessageEmbed } from "discord.js";
import { queueManager } from "../../managers/audio/queueManager";
import { ShoukakuTrack } from "shoukaku";
import { audioEmoji } from "../../utils/Constants";
import { isStageChannel } from "@sapphire/discord.js-utilities";
import { isHasSendPerm } from "../../utils/audioPermGuard";

@ApplyOptions<ListenerOptions>({
    name: "trackStart",
    emitter: "audioManager" as keyof Client,
    event: "trackStart"
})
export class clientListener extends Listener {
    async run(player: queueManager, track: ShoukakuTrack) {
        if(!track) {
            this.container.client.logger.warn(`${yellow("[Audio]")} ${magentaBright(`guildId ${player.textChannel.guildId} start playing ghost track. stopping now`)}`);
            return player.shoukakuPlayer.stopTrack()
        };
        if (player.playerTimeout) clearTimeout(player.playerTimeout);
        if (player.lastMessage) player.lastMessage.delete().catch(() => undefined);
        if (!isHasSendPerm(player.textChannel)) return;
        const msg = await player.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.PLAY} | Now playing \`${track.info.title!}\` [${track.requester!}]`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
        const voiceChannel = this.container.client.channels.cache.get(player.shoukakuPlayer.connection.channelId!);
        if (isStageChannel(voiceChannel) && voiceChannel) {
            if (voiceChannel.manageable && voiceChannel.guild.me?.voice.suppress) await voiceChannel.guild.me?.voice.setSuppressed(false);
            if (!voiceChannel.manageable && voiceChannel.guild.me?.voice.suppress && !voiceChannel.guild.me?.voice.requestToSpeakTimestamp) await voiceChannel.guild.me?.voice.setRequestToSpeak(true);
        }
        player.lastMessage = msg;
        this.container.client.logger.info(`${green("[Audio]")} ${magentaBright(`guildId ${player.textChannel.guildId} start playing track ${track.track}`)}`);
    }
}
