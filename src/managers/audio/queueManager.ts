import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { Message } from "discord.js";
import { ShoukakuPlayer } from "shoukaku";
import { audioManager } from "./audioManager";
import { filterManager } from "./filterManager";
import { queueTrack } from "./utils/queueTrack";
import { TrackUtils } from "./utils/TrackUtils";

export class queueManager {
    public constructor(public audioManager: audioManager, public shoukakuPlayer: ShoukakuPlayer, public textChannel: GuildTextBasedChannelTypes) {
        this.shoukakuPlayer.on("start", () => {
            this.audioManager.emit("trackStart", this, this.queueTrack.current);
        });
        this.shoukakuPlayer.on("end", () => {
            this.audioManager.emit("trackEnd", this, this.queueTrack.current);
        });
        this.shoukakuPlayer.on("exception", () => this.audioManager.emit("trackEnd", this, this.queueTrack.current));
        this.shoukakuPlayer.on("error", () => this.audioManager.emit("trackEnd", this, this.queueTrack.current));
    }

    public get stayInVc() {
        return this.audioManager.client.databases.guilds.cache.get(this.shoukakuPlayer.connection.guildId)?.stayInVc ?? false;
    }

    public playerTimeout: NodeJS.Timeout | undefined;
    public queueTrack = new queueTrack();
    public queueLoop = false;
    public trackLoop = false;
    public playing = false;
    public lastMessage: Message | undefined;
    public filters = new filterManager(this);

    public async play(track?: string, options?: { noReplace?: boolean | undefined; pause?: boolean | undefined; startTime?: number | undefined; endTime?: number | undefined } | undefined) {
        if (!track && !this.queueTrack.current) throw new RangeError("There are no available track to play.");
        if (TrackUtils.isUnresolved(this.queueTrack.current)) {
            const resolvedTrack = await this.audioManager.resolveTrack(`${this.queueTrack.current?.info.title} - ${this.queueTrack.current?.info.author}`, { requester: this.queueTrack.current?.requester });
            if (!resolvedTrack) return this.audioManager.emit("trackEnd", this, this.queueTrack.current);
            resolvedTrack.tracks[0].requester = this.queueTrack.current!.requester;
            this.queueTrack.current!.track = resolvedTrack.tracks[0].track;
        }
        return this.shoukakuPlayer.playTrack(track ?? this.queueTrack.current?.track!, options);
    }
}
