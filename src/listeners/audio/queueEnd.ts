import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from "colorette";
import { Client, MessageEmbed } from "discord.js";
import { queueManager } from "../../managers/audio/queueManager";
import { ShoukakuTrack } from "shoukaku";

@ApplyOptions<ListenerOptions>({
    name: "queueEnd",
    emitter: "audioManager" as keyof Client,
    event: "queueEnd"
})
export class clientListener extends Listener {
    async run(player: queueManager, track: ShoukakuTrack) {
        player.playing = false;
        player.queueTrack.current = null;
        player.queueTrack.previous = track;
        if (player.lastMessage) player.lastMessage.delete().catch(() => undefined);

        const msg = await player.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | The music queue has run out, request a song to play another song`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
        player.lastMessage = msg;
        this.container.client.logger.info(`${green("[Audio]")} ${magentaBright(`guildId ${player.textChannel.guildId} queue ended`)}`);
    }
}
