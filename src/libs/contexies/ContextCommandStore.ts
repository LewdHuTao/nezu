import { Store } from "@sapphire/framework";
import { ContextCommand } from "./ContextCommandPiece";

export class ContextCommandStore extends Store<ContextCommand> {
    constructor() {
        super(ContextCommand as any, { name: "contextCommands" });
    }

    async registerContext() {
        if (!this.container.client) return;
        const contextCommands = this.container.stores.get("contextCommands")!;
        const applicationCommandsCache = await this.container.client.application?.commands.fetch();
        for (const contextCommand of [...contextCommands.values()]) {
            if (applicationCommandsCache?.filter(x => x.name === contextCommand.name).size) return;
            // @ts-expect-error
            await this.container.client.application?.commands.create(contextCommand.options);
            continue;
        }
    }
}
