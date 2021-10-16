import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from 'colorette';
import { Client } from "discord.js";

@ApplyOptions<ListenerOptions>({
    name: "lavalinkDisconnected",
    emitter: "shoukaku" as keyof Client,
    event: "disconnected"
})
export class clientListener extends Listener {
    async run(name: string, reason: string) {
        this.container.client.logger.info(`${green("[Lavalink]")} ${magentaBright(`${name} disconnected, reason: ${reason}`)}`);
    }
}