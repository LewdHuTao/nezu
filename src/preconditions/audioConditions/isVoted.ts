import { PreconditionOptions, Precondition } from "@sapphire/framework";
import { Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { topGG } from "../../utils/topGG";

@ApplyOptions<PreconditionOptions>({
    name: "isVoted"
})

export abstract class alreadyConnect extends Precondition {
    public async run(message: Message) {
        const checkIsAllow = await this.shouldRun(message);
        if (!checkIsAllow) return this.error({ message: `❌ | Sorry, you must vote on top.gg to use this command [vote](https://top.gg/bot/${this.container.client.user?.id}/vote)` });
        return this.ok();
    }

    private shouldRun(message: Message) {
        return topGG.hasVoted(message.author.id);
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        isVoted: never;
    }
}
