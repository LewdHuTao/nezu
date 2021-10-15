import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from 'colorette';

@ApplyOptions<ListenerOptions>({
    name: "shoukakuDisconnected"
})
export class clientListener extends Listener {
    async run(name: string, reason: string) {
        this.container.client.logger.info(`${green("[Lavalink]")} ${magentaBright(`${name} disconnected, reason: ${reason}`)}`);
    }
}