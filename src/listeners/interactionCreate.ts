import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Interaction } from "discord.js";

@ApplyOptions<ListenerOptions>({
    name: "interactionCreate"
})
export class clientListener extends Listener {
    async run(interaction: Interaction) {
        if (interaction.isContextMenu() && interaction.inGuild()) {
            const contextCommand = this.container.stores.get("contextCommands").get(interaction.commandName);
            if (!contextCommand) return;
            await contextCommand.messageRun(interaction);
        } else if (interaction.isCommand() && interaction.inGuild()) {
            const contextCommand = this.container.stores.get("slashCommands").get(interaction.commandName);
            if (!contextCommand) return;
            await contextCommand.messageRun(interaction);
        }
    }
}
