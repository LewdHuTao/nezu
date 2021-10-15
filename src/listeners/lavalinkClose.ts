import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from 'colorette';

@ApplyOptions<ListenerOptions>({
    name: "shoukakuClose"
})
export class clientListener extends Listener {
    async run(name: string, code: number, reason: string) {
        this.container.client.logger.info(`${green("[Lavalink]")} ${magentaBright(`${name} closed, code: ${code}, reason: ${reason}`)}`);
    }
}