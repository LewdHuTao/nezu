import { PreconditionOptions, Precondition } from "@sapphire/framework";
import { Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<PreconditionOptions>({
    name: "onSameVoiceCondition"
})

export abstract class threadCondition extends Precondition {
    public async run(message: Message) {
        const checkIsAllow = this.shouldRun(message);
        if (!checkIsAllow) return this.error({ message: "❌ | You must join same voice to do this!" });
        return this.ok();
    }

    private shouldRun(message: Message) {
        if (!message.guild?.me?.voice.channelId) return true;
        return message.member?.voice.channelId === message.guild?.me?.voice.channelId;
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        onSameVoiceCondition: never;
    }
}
