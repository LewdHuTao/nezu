import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { magentaBright, red } from "colorette";
import { Guild } from "discord.js";

@ApplyOptions<ListenerOptions>({
    name: "guildDelete"
})
export class clientListener extends Listener {
    async run(guild: Guild) {
        if (!guild.available) return;
        if (this.container.client.audioManager.queue.has(guild.id)) {
            this.container.client.audioManager.queue.get(guild.id)?.shoukakuPlayer.connection.disconnect();
            this.container.client.audioManager.queue.delete(guild.id);
            this.container.client.logger.info(`${red("[Client]")} ${magentaBright(`${this.container.client.user!.username} kicked from ${guild.name} but there was active player`)}`);
        }
        await this.container.client.databases.guilds.delete(guild.id);
        this.container.client.logger.info(`${red("[Client]")} ${magentaBright(`${this.container.client.user!.username} kicked from ${guild.name}, deleted database`)}`);
    }
}
