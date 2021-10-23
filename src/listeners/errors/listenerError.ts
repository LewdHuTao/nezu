import { Events, Listener, ListenerErrorPayload, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { red, magentaBright } from "colorette";
import { sentryNode, transaction } from "../../utils/Sentry";

@ApplyOptions<ListenerOptions>({
    name: Events.ListenerError
})
export class clientListener extends Listener {
    async run(error: Error, context: ListenerErrorPayload) {
        sentryNode.captureException(error);
        transaction(error.name, error.message);
        this.container.client.logger.info(`${red("[Client]")} ${magentaBright(`caught an error: ${error.message}, piece: ${context.piece.name}`)}`);
    }
}
