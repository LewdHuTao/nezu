import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { Message } from "discord.js";
import { ShoukakuPlayer } from "shoukaku";
import { ShoukakuTrack } from "shoukaku/types/Constants";
import { TrackEndEvent, TrackStartEvent } from "shoukaku/types/guild/ShoukakuPlayer";
import { audioManager } from "./audioManager";
import { queueTrack } from "./utils/queueTrack";

export class queueManager {
    public constructor(public audioManager: audioManager, public shoukakuPlayer: ShoukakuPlayer, public textChannel: GuildTextBasedChannelTypes) {
        this.shoukakuPlayer.on("start", (payload: TrackStartEvent) => {
            this.audioManager.emit("trackStart", this, this.queueTrack.current, payload);
        });
        this.shoukakuPlayer.on("end", async (payload: TrackEndEvent) => {
            this.audioManager.emit("trackEnd", this, this.queueTrack.current, payload);
        });
    }

    public queueTrack = new queueTrack();
    public queueLoop = false;
    public trackLoop = false;
    public playing = false;
    public lastMessage: Message | undefined;
    
    public play(track?: string, options?: { noReplace?: boolean | undefined; pause?: boolean | undefined; startTime?: number | undefined; endTime?: number | undefined } | undefined) {
        if (!track && !this.queueTrack.current) throw new RangeError("There are no available track to play.");
        return this.shoukakuPlayer.playTrack(track ?? this.queueTrack.current!, options);
    }
}
