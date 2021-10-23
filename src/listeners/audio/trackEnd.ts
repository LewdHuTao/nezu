import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from "colorette";
import { Client } from "discord.js";
import { queueManager } from "../../managers/audio/queueManager";
import { ShoukakuTrack } from "shoukaku";

@ApplyOptions<ListenerOptions>({
    name: "trackEnd",
    emitter: "audioManager" as keyof Client,
    event: "trackEnd"
})
export class clientListener extends Listener {
    async run(player: queueManager, track: ShoukakuTrack) {
        player.shoukakuPlayer.position = 0;
        if (track) this.container.client.logger.info(`${green("[Audio]")} ${magentaBright(`guildId ${player.textChannel.guildId} stopped playing track ${track.track}`)}`);
        if (player.lastMessage) player.lastMessage.delete().catch(() => undefined);
        if (track && player.trackLoop) {
            if (!player.queueTrack.current) return player.audioManager.emit("queueEnd", player, track);
            return player.play();
        }


        if (track && player.queueLoop) {
            player.queueTrack.previous = player.queueTrack.current;
            if (!player.queueTrack.current) return player.audioManager.emit("queueEnd", player, track);
            player.queueTrack.add(player.queueTrack.current);
            player.queueTrack.current = player.queueTrack.shift()!;
            return player.play();
        }

        if (player.queueTrack.size) {
            player.queueTrack.previous = player.queueTrack.current;
            player.queueTrack.current = player.queueTrack.shift()!;
            return player.play();
        }

        if (!player.queueTrack.length) return player.audioManager.emit("queueEnd", player, track);
    }
}
