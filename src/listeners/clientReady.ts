import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright } from 'colorette';
import { Team } from "discord.js";
import { config } from "../utils/parsedConfig";

@ApplyOptions<ListenerOptions>({
    name: "ready",
    once: true
})
export class clientListener extends Listener {
    async run() {
        const developerId = await this.container.client.application?.fetch();
        if (developerId?.owner instanceof Team) {
            for (const [ownerId] of developerId?.owner.members) {
                if (!config.botOwners.includes(ownerId)) config.botOwners.push(ownerId);
                continue;
            }
        } else if (!config.botOwners.includes(developerId?.owner?.id!)) { config.botOwners.push(developerId?.owner?.id!); }
        this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`${this.container.client.user!.username} ready with ${this.container.client.guilds.cache.size} guilds`)}`);
    }
}