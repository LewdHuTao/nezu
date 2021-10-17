import { Shard, ShardingManager } from "discord.js";
import { join } from "path";
import "@sapphire/plugin-logger/register";
import * as colorette from "colorette";
import { Logger } from "@sapphire/plugin-logger";
colorette.createColors({ useColor: true });
const logger = new Logger();
const shardClient = new ShardingManager(join(__dirname, "structures", "NezuClient.js"), {
    respawn: true
});

shardClient.on("shardCreate", (shard: Shard) => {
    logger.info(`${colorette.green("[Shard]")} ${colorette.magentaBright(`Launched shard with Id: ${shard.id}`)}`);
});

shardClient.spawn().catch((error: Error) => console.info("Failed to spawn shard: %d", error.message));
