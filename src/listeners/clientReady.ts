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
            for (const [ownerId, user] of developerId?.owner.members) {
                if (!config.botOwners.includes(ownerId)) config.botOwners.push(ownerId);
                this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`registered ${user.user.username} as bot owner`)}`);
                continue;
            }
        } else if (!config.botOwners.includes(developerId?.owner?.id!)) { 
            try {
                const fetchedUser = await this.container.client.users.fetch(developerId?.owner?.id!)
                this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`registered ${fetchedUser.username} as bot owner`)}`);
                if (!config.botOwners.includes(developerId?.owner?.id!)) config.botOwners.push(developerId?.owner?.id!); 
            } catch(e) {
                if (!config.botOwners.includes(developerId?.owner?.id!)) config.botOwners.push(developerId?.owner?.id!);
                    this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`registered ${developerId?.owner?.id!} as bot owner, but failed to fetch`)}`);
            }
        }
        this.container.client.user?.setActivity({
            name: (this.container.client.application?.commands.cache.size ? "+play" : "/play") + ` | shard ${this.container.client.shard?.ids[0] ?? 1}/${this.container.client.shard?.ids.length ?? 1}`,
            type: this.container.client.application?.commands.cache.size ? "WATCHING" : "LISTENING"
        })
        this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`${this.container.client.user!.username} ready with ${this.container.client.guilds.cache.size} guilds`)}`);
    }
}