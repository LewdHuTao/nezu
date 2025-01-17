import { PreconditionOptions, Precondition } from "@sapphire/framework";
import { Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isStageChannel, isVoiceChannel } from "@sapphire/discord.js-utilities";
@ApplyOptions<PreconditionOptions>({
    name: "isCanConnect"
})

export abstract class isCanConnect extends Precondition {
    public async run(message: Message) {
        const checkIsAllow = this.shouldRun(message);
        if (!checkIsAllow) return this.error({ message: "❌ | Sorry i cant join your voice channel, make sure i have proper permissions!" });
        return this.ok();
    }

    private shouldRun(message: Message) {
        if (message.guild?.me?.permissions.has("ADMINISTRATOR")) return true;
        if (message.guild?.me?.voice.channel) return true;
        if (isVoiceChannel(message.member?.voice.channel) && !message.guild?.me?.voice.channel && message.member?.voice.channel?.joinable && message.member?.voice.channel?.speakable) return true;
        if (isStageChannel(message.member?.voice.channel) && !message.guild?.me?.voice.channel && message.member?.voice.channel?.joinable) return true;
        return false;
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        isCanConnect: never;
    }
}
