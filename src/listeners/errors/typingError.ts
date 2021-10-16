import { CommandTypingErrorPayload, Events, Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { red, magentaBright } from "colorette";

@ApplyOptions<ListenerOptions>({
    name: Events.CommandTypingError
})
export class clientListener extends Listener {
    async run(error: Error, context: CommandTypingErrorPayload) {
        this.container.client.logger.info(`${red("[Client]")} ${magentaBright(`caught an error: ${error.message}, command: ${context.context.commandName}`)}`);
    }
}
