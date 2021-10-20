import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { blue, magentaBright } from "colorette";
import { Guild } from "discord.js";

@ApplyOptions<ListenerOptions>({
    name: "guildCreate"
})
export class clientListener extends Listener {
    async run(guild: Guild) {
        if (!guild.available) return;
        await this.container.client.databases.guilds.get(guild.id);
        this.container.client.logger.info(`${blue("[Client]")} ${magentaBright(`${this.container.client.user!.username} invited to ${guild.name}, initialized database`)}`);
    }
}
