import { Store } from "@sapphire/framework";
import { SlashCommand } from "./SlashCommandPiece";

export class SlashCommandStore extends Store<SlashCommand> {
    constructor() {
        super(SlashCommand as any, { name: "slashCommands" });
    }

    async registerSlash() {
        if (!this.container.client) return;
        const contextCommands = this.container.stores.get("slashCommands")!;
        const applicationCommandsCache = await this.container.client.application?.commands.fetch();
        for (const SlashCommand of [...contextCommands.values()]) {
            if (!applicationCommandsCache?.filter(x => x.name === SlashCommand.name).size) {
                await this.container.client.application?.commands.create(SlashCommand.options);
            }
            continue;
        }
    }
}
