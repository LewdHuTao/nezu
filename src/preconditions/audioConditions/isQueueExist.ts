import { PreconditionOptions, Precondition } from "@sapphire/framework";
import { Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
@ApplyOptions<PreconditionOptions>({
    name: "isQueueExist"
})

export abstract class isQueueExist extends Precondition {
    public async run(message: Message) {
        const checkIsAllow = this.shouldRun(message);
        if (!checkIsAllow) return this.error({ message: "❌ | There are no queue in this server!" });
        return this.ok();
    }

    private shouldRun(message: Message) {
        return this.container.client.audioManager.queue.has(message.guildId!);
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        isQueueExist: never;
    }
}
