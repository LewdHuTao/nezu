import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from "colorette";
import { Client } from "discord.js";

@ApplyOptions<ListenerOptions>({
    name: "lavalinkClose",
    emitter: "shoukaku" as keyof Client,
    event: "close"
})
export class clientListener extends Listener {
    async run(name: string, code: number, reason: string) {
        this.container.client.logger.info(`${green("[Lavalink]")} ${magentaBright(`${name} closed, code: ${code}, reason: ${reason}`)}`);
    }
}
