import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from 'colorette';

@ApplyOptions<ListenerOptions>({
    name: "shoukakuError"
})
export class clientListener extends Listener {
    async run(name: string, error: Error) {
        this.container.client.logger.info(`${green("[Lavalink]")} ${magentaBright(`${name} error caught: ${error.message}`)}`);
    }
}