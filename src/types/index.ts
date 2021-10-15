import { Snowflake } from "discord.js";
import { NodeOptions } from "erela.js";

export interface configType {
    bot: {
        clientToken: string | undefined
    },
    lavalink: NodeOptions[],
    botOwners: Snowflake[]
}