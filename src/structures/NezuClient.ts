import { SapphireClient } from "@sapphire/framework";
import { Intents, Message } from "discord.js";
import { join } from "path";
import { Libraries, Shoukaku } from "shoukaku";
import { GuildDatabaseManager } from "../databases/managers/GuildDatabaseManager";
import { config } from "../utils/parsedConfig";

class NezuClient extends SapphireClient {
    public shoukaku = new Shoukaku(new Libraries.DiscordJS(this), config.lavalink, {
        reconnectTries: 1000,
        moveOnDisconnect: true,
        resumable: true,
        resumableTimeout: 360
    });

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
    }
}
export = new NezuClient().login();
