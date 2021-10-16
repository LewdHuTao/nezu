import { SapphireClient } from "@sapphire/framework";
import { Intents } from "discord.js";
import { join } from 'path';
import { Libraries, Shoukaku } from "shoukaku";
import { config } from "../utils/parsedConfig";

class NezuClient extends SapphireClient {
    constructor() {
        super({
            defaultPrefix: "+",
            typing: true,
            baseUserDirectory: join(__dirname, ".."),
            caseInsensitiveCommands: true,
            caseInsensitivePrefixes: true,
            loadDefaultErrorListeners: false,
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
        })
    }
    public shoukaku = new Shoukaku(new Libraries.DiscordJS(this), config.lavalink, {
        reconnectTries: 1000,
        moveOnDisconnect: true,
        resumable: true,
        resumableTimeout: 360,
    });
}

export = new NezuClient().login();