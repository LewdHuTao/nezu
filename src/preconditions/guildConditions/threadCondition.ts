import { PreconditionOptions, Precondition } from "@sapphire/framework";
import { Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<PreconditionOptions>({
    name: "threadCondition"
})

export abstract class threadCondition extends Precondition {

    public async run(message: Message) {
        const checkIsAllow = this.shouldRun(message);
        if (!checkIsAllow) return this.error({ message: "❌ | I dont have send message in that thread!" });
        return this.ok();
    }

    private shouldRun(message: Message) {
       if(message.channel.type === "GUILD_PRIVATE_THREAD" ||  message.channel.type === "GUILD_PUBLIC_THREAD" ||  message.channel.type === "GUILD_NEWS_THREAD") return message.channel.permissionsFor(message.guild?.me!).has("SEND_MESSAGES_IN_THREADS");
       else return true
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        threadCondition: never;
    }
}