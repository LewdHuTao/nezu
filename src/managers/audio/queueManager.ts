import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { Message } from "discord.js";
import { ShoukakuPlayer } from "shoukaku";
import { TrackEndEvent, TrackStartEvent } from "shoukaku/types/guild/ShoukakuPlayer";
import { ShoukakuTrack } from "../../types";
import { audioManager } from "./audioManager";
import { queueTrack } from "./utils/queueTrack";
import { TrackUtils } from "./utils/TrackUtils";

export class queueManager {
    public constructor(public audioManager: audioManager, public shoukakuPlayer: ShoukakuPlayer, public textChannel: GuildTextBasedChannelTypes) {
        this.shoukakuPlayer.on("start", (payload: TrackStartEvent) => {
            this.audioManager.emit("trackStart", this, this.queueTrack.current, payload);
        });
        this.shoukakuPlayer.on("end", (payload: TrackEndEvent) => {
            this.audioManager.emit("trackEnd", this, this.queueTrack.current, payload);
        });
    }

    public queueTrack = new queueTrack();
    public queueLoop = false;
    public trackLoop = false;
    public playing = false;
    public lastMessage: Message | undefined;

    public async play(track?: string, options?: { noReplace?: boolean | undefined; pause?: boolean | undefined; startTime?: number | undefined; endTime?: number | undefined } | undefined) {
        if (!track && !this.queueTrack.current) throw new RangeError("There are no available track to play.");
        if (TrackUtils.isUnresolved(this.queueTrack.current)) {
            const resolvedTrack = await this.audioManager.resolveTrack(`${this.queueTrack.current?.info.title} - ${this.queueTrack.current?.info.author}`, { requester: (this.queueTrack.current as ShoukakuTrack)?.requester });
            if (!resolvedTrack) throw new RangeError("Could not resolve unresolve track, cant find same track.");
            // @ts-expect-error
            resolvedTrack.tracks[0].requester = this.queueTrack.current.requester;
            this.queueTrack.current = resolvedTrack.tracks[0];
        }
        return this.shoukakuPlayer.playTrack(track ?? this.queueTrack.current!, options);
    }
}
