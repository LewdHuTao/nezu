import { ILogger, LogLevel, SapphireClient } from "@sapphire/framework";
import { Logger } from "@sapphire/plugin-logger";
import { Intents, Message } from "discord.js";
import { join } from "path";
import { Libraries, Shoukaku } from "shoukaku";
import { GuildDatabaseManager } from "../databases/managers/GuildDatabaseManager";
import { audioManager } from "../managers/audio/audioManager";
import { config } from "../utils/parsedConfig";

class NezuClient extends SapphireClient {
    public shoukaku = new Shoukaku(new Libraries.DiscordJS(this), config.lavalink, {
        reconnectTries: 1000,
        moveOnDisconnect: true
    });

    public audioManager: audioManager = new audioManager(this.shoukaku, this);
    public databases = {
        guilds: new GuildDatabaseManager()
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
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
        });
    }
}

declare module "@sapphire/framework" {
    export interface SapphireClient {
        databases: {
            guilds: GuildDatabaseManager;
        };
        shoukaku: Shoukaku;
        audioManager: audioManager;
    }
}
export = new NezuClient().login();
