import { ILogger, LogLevel, SapphireClient } from "@sapphire/framework";
import { Logger } from "@sapphire/plugin-logger";
import { Intents, Message } from "discord.js";
import { join } from "path";
import { Libraries, Shoukaku } from "shoukaku";
import { GuildDatabaseManager } from "../databases/managers/GuildDatabaseManager";
import { PlaylistDatabaseManager } from "../databases/managers/PlaylistDatabaseManager";
import { PlaylistTrackDatabaseManager } from "../databases/managers/PlaylistTrackDatabaseManager";
import { ContextCommandStore } from "../libs/contexies/ContextCommandStore";
import { SlashCommandStore } from "../libs/slashies/SlashCommandStore";
import { audioManager } from "../managers/audio/audioManager";
import { AppleMusic } from "../managers/audio/plugins/AppleMusic";
import { Bilibili } from "../managers/audio/plugins/Bilibili";
import Spotify from "../managers/audio/plugins/Spotify";
import { Tidal } from "../managers/audio/plugins/Tidal";
import { config } from "../utils/parsedConfig";

class NezuClient extends SapphireClient {
    public shoukaku = new Shoukaku(new Libraries.DiscordJS(this), config.lavalink, {
        reconnectTries: 1000,
        moveOnDisconnect: true
    });

    public audioManager: audioManager = new audioManager(this, {
        plugins: [
            new AppleMusic(),
            new Tidal(),
            new Bilibili(),
            new Spotify({
                cacheTrack: true,
                clientId: config.spotifyClientId,
                clientSecret: config.spotifyClientSecret,
                maxCacheLifeTime: config.cacheLifeTime,
                strategy: "API"
            })
        ]
    });

    public databases = {
        guilds: new GuildDatabaseManager(),
        userPlaylists: new PlaylistDatabaseManager(),
        playlistTrack: new PlaylistTrackDatabaseManager()
    };

    constructor() {
        super({
            fetchPrefix: async (message: Message) => {
                const guildDatabase = await this.databases.guilds.get(message.guildId!);
                return guildDatabase.prefix ?? "+";
            },
            failIfNotExists: false,
            allowedMentions: {
                users: [],
                repliedUser: false,
                roles: []
            },
            logger: {
                level: config.devmode ? LogLevel.Debug : LogLevel.Info,
                instance: new Logger() as unknown as ILogger
            },
            defaultCooldown: {
                limit: 3,
                delay: 3000
            },
            typing: true,
            baseUserDirectory: join(__dirname, ".."),
            caseInsensitiveCommands: true,
            caseInsensitivePrefixes: true,
            loadDefaultErrorListeners: false,
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
        });
        this.stores.register(new SlashCommandStore());
        this.stores.register(new ContextCommandStore());
    }
}

declare module "@sapphire/framework" {
    export interface SapphireClient {
        databases: {
            guilds: GuildDatabaseManager;
            userPlaylists: PlaylistDatabaseManager;
            playlistTrack: PlaylistTrackDatabaseManager;
        };
        shoukaku: Shoukaku;
        audioManager: audioManager;
    }
}
export = new NezuClient().login();
