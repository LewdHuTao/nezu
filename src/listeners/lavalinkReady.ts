import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from 'colorette';
import { Client } from "discord.js";

@ApplyOptions<ListenerOptions>({
    name: "lavalinkReady",
    emitter: "shoukaku" as keyof Client,
    event: "ready"
})
export class clientListener extends Listener {
    async run(name: string) {
        this.container.client.logger.info(`${green("[Lavalink]")} ${magentaBright(`${name} has been connected!`)}`);
    }
}