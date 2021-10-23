import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from "colorette";
import { Client, MessageEmbed } from "discord.js";
import { queueManager } from "../../managers/audio/queueManager";
import { ShoukakuTrack } from "shoukaku";
import { audioEmoji } from "../../utils/Constants";

@ApplyOptions<ListenerOptions>({
    name: "trackStart",
    emitter: "audioManager" as keyof Client,
    event: "trackStart"
})
export class clientListener extends Listener {
    async run(player: queueManager, track: ShoukakuTrack) {
        if (player.playerTimeout) clearTimeout(player.playerTimeout);
        if (player.lastMessage) player.lastMessage.delete().catch(() => undefined);
        const msg = await player.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`${audioEmoji.PLAY} | Now playing \`${track.info.title!}\` [${track.requester!}]`)
                    .setColor("LUMINOUS_VIVID_PINK")
            ]
        });
        player.lastMessage = msg;
        this.container.client.logger.info(`${green("[Audio]")} ${magentaBright(`guildId ${player.textChannel.guildId} start playing track ${track.track}`)}`);
    }
}
