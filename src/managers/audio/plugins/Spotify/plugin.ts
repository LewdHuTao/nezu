import { User } from "discord.js";
// @ts-expect-error
import { ShoukakuTrackList } from "shoukaku";
import { ShoukakuTrackList as ShoukakuTrackListType } from "shoukaku/types/Constants";
import { lavalinkSource, ShoukakuTrack } from "../../../../types";
import { audioManager } from "../../audioManager";
import resolver from "./resolver";
import { Result, SpotifyOptions } from "./typings";
import { Plugin } from "../../utils/Plugin";

const check = (options?: SpotifyOptions) => {
    if (
        typeof options?.strategy !== "undefined" &&
        typeof options?.strategy !== "string"
    ) {
        throw new TypeError(
            "Spotify option \"strategy\" must be a string."
        );
    }

    if (
        typeof options?.strategy !== "undefined" &&
        options?.strategy === "API" &&
        !options?.clientSecret
    ) {
        throw new TypeError(
            "Spotify option \"clientSecret\" required if strategy set to API."
        );
    }
    if (
        typeof options?.strategy !== "undefined" &&
        options?.strategy === "API" &&
        !options?.clientId
    ) {
        throw new TypeError(
            "Spotify option \"clientId\" required if strategy set to API."
        );
    }
    if (
        typeof options?.playlistPageLimit !== "undefined" &&
        typeof options?.playlistPageLimit !== "number"
    ) {
        throw new TypeError(
            "Spotify option \"playlistPageLimit\" must be a number."
        );
    }
    if (
        typeof options?.albumPageLimit !== "undefined" &&
        typeof options?.albumPageLimit !== "number"
    ) {
        throw new TypeError(
            "Spotify option \"albumPageLimit\" must be a number."
        );
    }

    if (
        typeof options?.showPageLimit !== "undefined" &&
        typeof options?.showPageLimit !== "number"
    ) {
        throw new TypeError(
            "Spotify option \"showPageLimit\" must be a number."
        );
    }
    if (
        typeof options?.maxCacheLifeTime !== "undefined" &&
        typeof options?.maxCacheLifeTime !== "number"
    ) {
        throw new TypeError(
            "Spotify option \"maxCacheLifeTime\" must be a number."
        );
    }
};

export class Spotify extends Plugin {
    public name = "Spotify";
    public readonly resolver = new resolver(this);
    public spotifyMatch = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|episode|show|album)[\/:]([A-Za-z0-9]+)/;


    private _resolveTrack!: (query: string, options?: { requester?: User; source?: lavalinkSource }) => Promise<ShoukakuTrackList | null>;
    private readonly functions = {
        track: this.resolver.getTrack,
        album: this.resolver.getAlbum,
        playlist: this.resolver.getPlaylist,
        artist: this.resolver.getArtist,
        show: this.resolver.getShow,
        episode: this.resolver.getEpisode
    };

    public audioManager: audioManager | undefined;
    public constructor(public options?: SpotifyOptions) {
        super();
        check(options);
        this.options = {
            ...options
        };
        if (this.options?.strategy === "API") {
            void this.resolver.renew();
        }
    }

    public async load(audioManager: audioManager) {
        this.audioManager = audioManager;
        this._resolveTrack = audioManager.resolveTrack.bind(audioManager);
        audioManager.resolveTrack = this.resolveTrack.bind(this);
    }

    private async resolveTrack(query: string, options?: { requester?: User; source?: lavalinkSource }): Promise<ShoukakuTrackList | null> {
        const [, type, id] = query.match(this.spotifyMatch) ?? [];
        if (type in this.functions) {
            try {
                const func = this.functions[type as keyof Spotify["functions"]];
                if (func) {
                    const data: Result = await func.fetch(query, id);
                    const loadType = type === "track" || type === "episode" ? "TRACK_LOADED" : "PLAYLIST_LOADED";
                    const name = ["playlist", "album", "artist", "episode", "show"].includes(type) ? data.name : null;
                    const trackResult = new ShoukakuTrackList({ loadType, playlistInfo: { name }, tracks: data.tracks }) as ShoukakuTrackListType;
                    if (trackResult && options?.requester && (trackResult.type === "TRACK" || trackResult.type === "PLAYLIST" || trackResult.type === "SEARCH")) {
                        trackResult.tracks = trackResult.tracks.map(x => {
                            (x as ShoukakuTrack).requester = options?.requester;
                            return x;
                        });
                    }
                    return trackResult;
                }
                return null;
            } catch (e) {
                return null;
            }
        }
        return this._resolveTrack(query, options);
    }

    public unload(manager: audioManager) {
        return manager.plugins?.filter(x => x.name === this.name).shift();
    }
}


