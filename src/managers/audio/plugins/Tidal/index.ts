import { Collection, User } from "discord.js";
import { ShoukakuTrackList } from "shoukaku";
import { audioManager } from "../../audioManager";
import { Plugin } from "../../utils/Plugin";
import fetch from "petitio";
import { config } from "../../../../utils/parsedConfig";
import { LavalinkSource } from "shoukaku/types";
import { Result } from "../Spotify/typings";
export class Tidal extends Plugin {
    public name = "tidal";
    public regex = /^(http|https):\/\/tidal.com\/browse\/(track|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/;
    public manager!: audioManager;
    private _resolveTrack!: (query: string, options?: { requester?: User; source?: LavalinkSource }) => Promise<ShoukakuTrackList | null>;
    public cache: Collection<string, any> = new Collection();
    private readonly _tidalToken = config.tidalToken;
    private readonly _tidalBaseApi = "https://api.tidal.com/v1";

    private readonly functions = {
        track: this.getTrack.bind(this),
        playlist: this.getPlaylist.bind(this)
    };

    public load(manager: audioManager) {
        this.manager = manager;
        setInterval(() => this.cache.clear(), config.cacheLifeTime);
        this._resolveTrack = manager.resolveTrack.bind(manager);
        manager.resolveTrack = this.resolveTrack.bind(this);
    }

    private async resolveTrack(query: string, options?: { requester?: User; source?: LavalinkSource }): Promise<ShoukakuTrackList | null> {
        const [, , type, id] = this.regex.exec(query) ?? [];
        if (type in this.functions) {
            try {
                const func = this.functions[type as keyof Tidal["functions"]];
                const searchTrack: Result = await func(id);
                const loadType = type === "music-video" ? "TRACK_LOADED" : "PLAYLIST_LOADED";
                const name = ["artist", "album", "playlist"].includes(type) ? searchTrack.name : null;
                const trackResult = new ShoukakuTrackList({ loadType, playlistInfo: { name }, tracks: searchTrack.tracks });
                if (trackResult && options?.requester && (trackResult.type === "TRACK" || trackResult.type === "PLAYLIST" || trackResult.type === "SEARCH")) {
                    trackResult.tracks = trackResult.tracks.map(x => {
                        x.requester = options?.requester;
                        return x;
                    });
                }
                return trackResult;
            } catch (e) {
                return null;
            }
        }

        return this._resolveTrack(query, options);
    }

    private async getTrack(id: string) {
        const track = await fetch(`${this._tidalBaseApi}/tracks/${id}?countryCode=us&limit=200`)
            .header("x-tidal-token", this._tidalToken)
            .header("origin", "http://listen.tidal.com")
            .json();
        return { tracks: [Tidal.convertToUnresolved(track)] };
    }

    private async getPlaylist(id: string) {
        const playlistMeta = await fetch(`${this._tidalBaseApi}/playlists/${id}?countryCode=us`)
            .header("x-tidal-token", this._tidalToken)
            .header("origin", "http://listen.tidal.com")
            .json();
        const track = await fetch(`${this._tidalBaseApi}/playlists/${id}/tracks?countryCode=us&limit=999`)
            .header("x-tidal-token", this._tidalToken)
            .header("origin", "http://listen.tidal.com")
            .json();
        return {
            tracks: track.items.map((x: any) => Tidal.convertToUnresolved(x)),
            name: playlistMeta.title
        };
    }

    private static convertToUnresolved(track: any) {
        if (!track) {
            throw new ReferenceError("The Apple music track object was not provided");
        }
        if (!track.title) {
            throw new ReferenceError("The track name was not provided");
        }
        if (typeof track.title !== "string") {
            throw new TypeError(
                `The track name must be a string, received type ${typeof track.name}`
            );
        }

        return {
            info: {
                title: track.title,
                author: track.artist ?? "-",
                length: track.duration ?? 1
            }
        };
    }

    public unload(manager: audioManager) {
        return manager.plugins?.filter(x => x.name === this.name).shift();
    }
}
