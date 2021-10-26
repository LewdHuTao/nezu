import { CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";
import ms from "ms";

@ApplyOptions<CommandOptions>({
    name: "ping",
    description: "ping pong with the bot",
    preconditions: ["threadCondition"],
    requiredClientPermissions: ["SEND_MESSAGES"]
})

export class clientCommand extends Command {
    async messageRun(message: Message) {
        const msg = await message.channel.send("Pong");
        await msg.edit(`Pong :ping_pong: | ${msg.createdTimestamp - message.createdTimestamp} ms, ws ${this.container.client.ws.ping} ms, online for ${ms(this.container.client.uptime!, { long: true })}`);
    }
}
