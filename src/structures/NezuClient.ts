import { SapphireClient } from "@sapphire/framework";
import { Intents } from "discord.js";
import { join } from 'path';

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
}

export = new NezuClient().login();