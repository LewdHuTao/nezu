import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { green, magentaBright, red } from "colorette";
import { Team } from "discord.js";
import { config } from "../utils/parsedConfig";
import { createConnection } from "typeorm";
import { resolve } from "path";
import { topGG } from "../utils/topGG";

@ApplyOptions<ListenerOptions>({
    name: "ready",
    once: true
})
export class clientListener extends Listener {
    async run() {
        const developerId = await this.container.client.application?.fetch();
        if (developerId?.owner instanceof Team) {
            for (const [ownerId, user] of developerId.owner.members) {
                if (!config.botOwners.includes(ownerId)) config.botOwners.push(ownerId);
                this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`registered ${user.user.username} as bot owner`)}`);
                continue;
            }
        } else if (!config.botOwners.includes(developerId?.owner?.id!)) {
            try {
                const fetchedUser = await this.container.client.users.fetch(developerId?.owner?.id!);
                this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`registered ${fetchedUser.username} as bot owner`)}`);
                if (!config.botOwners.includes(developerId?.owner?.id!)) config.botOwners.push(developerId?.owner?.id!);
            } catch (e) {
                if (!config.botOwners.includes(developerId?.owner?.id!)) config.botOwners.push(developerId?.owner?.id!);
                this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`registered ${developerId?.owner?.id!} as bot owner, but failed to fetch`)}`);
            }
        }
        this.container.client.user?.setActivity({
            name: `${this.container.client.application?.commands.cache.size ? "+play" : "/play"} | shard ${this.container.client.shard?.ids[0] ?? 1}/${this.container.client.shard?.ids.length ?? 1}`,
            type: this.container.client.application?.commands.cache.size ? "WATCHING" : "LISTENING"
        });
        await this.container.stores.get("contextCommands").registerContext();
        setInterval(async () => {
            await topGG.postStats({
                serverCount: this.container.client.guilds.cache.size,
                shardCount: this.container.client.shard?.count ?? 1,
                shardId: this.container.client.shard?.ids[0],
                shards: this.container.client.shard?.ids
            });
        }, 15000);
        await createConnection({
            database: "database",
            entities: [
                `${resolve(__dirname, "..", "databases/entities")}/**/*.ts`,
                `${resolve(__dirname, "..", "databases/entities")}/**/*.js`
            ],
            type: "mongodb",
            url: config.mongoDatabaseURL,
            useUnifiedTopology: true
        }).catch((e: Error) => {
            this.container.client.logger.info(`${red("[Client]")} ${magentaBright(`caught database error: ${e.message}`)}`);
            this.container.client.logger.info(`${green("[Client]")} ${magentaBright("could not connect to database, exiting")}`);
            return process.exit(1);
        }).then(() => {
            for (const database of Object.values(this.container.client.databases)) {
                database._init();
            }
            this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`initialized ${Object.values(this.container.client.databases).length} databases`)}`);
        });
        this.container.client.logger.info(`${green("[Client]")} ${magentaBright(`${this.container.client.user!.username} ready with ${this.container.client.guilds.cache.size} guilds`)}`);
    }
}
