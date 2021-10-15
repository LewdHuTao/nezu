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

    login(token?: string) {
        this._setupConflictShoukaku();
        return super.login(token);
    }

    private _setupConflictShoukaku() {
        this.shoukaku.on('ready',(name) => this.emit("shoukakuReady", name));
        this.shoukaku.on('error', (name, error) => this.emit("shoukakuError", name, error));
        this.shoukaku.on('close', (name, code, reason) => this.emit("shoukakuClose", name, code, reason));
        this.shoukaku.on('disconnect', (name, reason) => this.emit("shoukakuDisconnect", name, reason));
    }

}

export = new NezuClient().login();