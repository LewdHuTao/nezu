import { Events, Listener, ListenerErrorPayload, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { red, magentaBright } from 'colorette';

@ApplyOptions<ListenerOptions>({
    name: Events.ListenerError,
})
export class clientListener extends Listener {
    async run(error: Error, context: ListenerErrorPayload) {
        this.container.client.logger.info(`${red("[Client]")} ${magentaBright(`caught an error: ${error.message}, piece: ${context.piece.name}`)}`);
    }
}