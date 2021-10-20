import { PreconditionOptions, Precondition } from "@sapphire/framework";
import { Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Constants } from "shoukaku";
@ApplyOptions<PreconditionOptions>({
    name: "alreadyConnect"
})

export abstract class alreadyConnect extends Precondition {
    public async run(message: Message) {
        const checkIsAllow = this.shouldRun(message);
        if (!checkIsAllow) return this.error({ message: "❌ | Cannot join because i already connected to voice channel!" });
        return this.ok();
    }

    private shouldRun(message: Message) {
        if (this.container.client.audioManager.queue.get(message.guildId!)?.shoukakuPlayer.connection.state! === Constants.state.CONNECTED) return false;
        return true;
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        alreadyConnect: never;
    }
}
