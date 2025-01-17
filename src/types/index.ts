import { Snowflake } from "discord.js";
import { NodeOptions } from "shoukaku/types";
import { ContextCommandStore } from "../libs/contexies/ContextCommandStore";
import { SlashCommandStore } from "../libs/slashies/SlashCommandStore";

export interface configType {
    bot: {
        clientToken: string | undefined;
    };
    lavalink: NodeOptions[];
    botOwners: Snowflake[];
    cacheLifeTime: number;
    redisHost: string;
    redisPort: number;
    redisPassword: string;
    redisUsername: string;
    redisUrl: string;
    mongoDatabaseURL: string | undefined;
    weebyToken: string;
    devmode: boolean;
    spotifyClientId: string;
    spotifyClientSecret: string;
    dsnUrl: string;
    topGGToken: string;
    tidalToken: string;
}

export interface jsonWeebyFormatText {
    status: number;
    format: string;
    output: string;
}


declare module "@sapphire/framework" {
    interface StoreRegistryEntries {
        contextCommands: ContextCommandStore;
        slashCommands: SlashCommandStore;
    }
}
