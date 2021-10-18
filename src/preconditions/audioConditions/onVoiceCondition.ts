import { PreconditionOptions, Precondition } from "@sapphire/framework";
import { Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<PreconditionOptions>({
    name: "onVoiceCondition"
})

export abstract class threadCondition extends Precondition {
    public async run(message: Message) {
        const checkIsAllow = this.shouldRun(message);
        if (!checkIsAllow) return this.error({ message: "❌ | You must join voice to do this!" });
        return this.ok();
    }

    private shouldRun(message: Message) {
        return Boolean(message.member?.voice.channelId);
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        onVoiceCondition: never;
    }
}
