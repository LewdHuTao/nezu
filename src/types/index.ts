import { Snowflake, User } from "discord.js";
import { Base64String, NodeOptions } from "shoukaku/types/Constants";

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
}

export interface jsonWeebyFormatText {
    status: number;
    format: string;
    output: string;
}

export type lavalinkSource = "youtube" | "youtube-music" | "soundcloud";

export class ShoukakuTrack {
    requester: User | undefined;
    track!: Base64String;
    info!: {
        identifier?: string;
        isSeekable?: boolean;
        author?: string;
        length?: number;
        isStream?: boolean;
        position?: number;
        title?: string;
        uri?: string;
    };
}

export class UnresolvedShoukakuTrack {
    requester?: User | undefined;
    track?: Base64String;
    info!: {
        identifier?: string;
        isSeekable?: boolean;
        author: string;
        length: number;
        isStream?: boolean;
        position?: number;
        title: string;
        uri?: string;
    };
}
