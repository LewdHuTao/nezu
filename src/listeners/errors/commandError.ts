import { CommandErrorPayload, Events, Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { red, magentaBright } from 'colorette';

@ApplyOptions<ListenerOptions>({
    name: Events.CommandError,
})
export class clientListener extends Listener {
    async run(error: Error, context: CommandErrorPayload) {
        this.container.client.logger.info(`${red("[Client]")} ${magentaBright(`caught an error: ${error.message}, command: ${context.piece.name}`)}`);
    }
}