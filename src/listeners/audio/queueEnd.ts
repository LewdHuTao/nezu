import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { green, magentaBright } from "colorette";
import { Client, MessageEmbed } from "discord.js";
import { ShoukakuTrack } from "shoukaku";
import { queueManager } from "../../managers/audio/queueManager";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<ListenerOptions>({
    name: "queueEnd",
    emitter: "audioManager" as keyof Client,
    event: "queueEnd"
})
export class clientListener extends Listener {
    async run(player: queueManager, track: ShoukakuTrack) {
        player.queueTrack.current = null;
        player.queueTrack.previous = track ?? null;
        if (player.lastMessage) player.lastMessage.delete().catch(() => undefined);
        const msg = await player.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.CHECK_MARK} | The music queue has run out, request a song to play another song`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
        player.lastMessage = msg;
        this.container.client.logger.info(`${green("[Audio]")} ${magentaBright(`guildId ${player.textChannel.guildId} queue ended`)}`);
        if (player.stayInVc) return;
        player.playerTimeout = setTimeout(() => {
            player.shoukakuPlayer.connection.disconnect();
            /* eslint @typescript-eslint/no-empty-function: "off" */
            player.lastMessage?.delete().catch(() => {});
            player.textChannel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${audioEmoji.CHECK_MARK} | I've been inactive for 3 minutes, destroying player`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            /* eslint @typescript-eslint/no-empty-function: "off" */
            }).catch(() => {});
            this.container.client.audioManager.queue.delete(player.shoukakuPlayer.connection.guildId);
        }, 180000).unref();
    }
}
