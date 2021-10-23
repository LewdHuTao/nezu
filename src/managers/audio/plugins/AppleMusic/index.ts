import { Collection, User } from "discord.js";
import { ShoukakuTrackList } from "shoukaku";
import { LavalinkSource } from "shoukaku/types";
import { config } from "../../../../utils/parsedConfig";
import { audioManager } from "../../audioManager";
import { Plugin } from "../../utils/Plugin";
import cheerio from "cheerio";
import fetch from "petitio";
import { Result } from "../Spotify/typings";

export class AppleMusic extends Plugin {
    public name = "AppleMusic";
    public manager!: audioManager;
    public regex = /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/;

    private _resolveTrack!: (query: string, options?: { requester?: User; source?: LavalinkSource }) => Promise<ShoukakuTrackList | null>;
    public cache: Collection<string, any> = new Collection();

    private readonly functions = {
        artist: this.getArtist.bind(this),
        album: this.getAlbum.bind(this),
        playlist: this.getPlaylist.bind(this),
        "music-video": this.getTrack.bind(this)
    };


    public load(manager: audioManager) {
        this.manager = manager;
        setTimeout(() => this.cache.clear(), config.cacheLifeTime);
        this._resolveTrack = manager.resolveTrack.bind(manager);
        manager.resolveTrack = this.resolveTrack.bind(this);
    }

    private async resolveTrack(query: string, options?: { requester?: User; source?: LavalinkSource }): Promise<ShoukakuTrackList | null> {
        const [url, type] = this.regex.exec(query) ?? [];
        if (type in this.functions) {
            try {
                const func = this.functions[type as keyof AppleMusic["functions"]];
                const searchTrack: Result = await func(url);
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

    public unload(manager: audioManager) {
        return manager.plugins?.filter(x => x.name === this.name).shift();
    }

    private async getAlbum(url: string) {
        const html = await fetch(url).text();
        const $ = cheerio.load(html);
        const trackName = $(".songs-list-row__song-name-wrapper")
            .toArray()
            .map(x => ({
                title: cheerio.load(x)(".songs-list-row__song-name").text().trim(),
                artist: cheerio.load(x)(".songs-list-row__by-line").text().trim().length <= 1 ? $(".product-creator").text().trim() : cheerio.load(x)(".songs-list-row__by-line").text().trim()
            }));
        return {
            tracks: trackName.map(x => AppleMusic.convertToUnresolved(x)),
            name: $(".product-name").eq(0).text()
                .trim()
        };
    }

    private async getArtist(url: string) {
        const html = await fetch(`${url}/see-all?section=top-songs`).text();
        const $ = cheerio.load(html);
        const trackName = $(".songs-list-row__song-name-wrapper")
            .toArray()
            .map(x => ({
                title: cheerio.load(x)(".songs-list-row__song-name").text().trim(),
                artist: cheerio.load(x)(".songs-list-row__by-line").text().trim()
            }));
        return {
            tracks: trackName.map(x => AppleMusic.convertToUnresolved(x)),
            name: $(".titled-box-header").eq(0).text()
                .trim()
        };
    }

    private async getPlaylist(url: string) {
        const html = await fetch(url).text();
        const $ = cheerio.load(html);
        const trackName = $(".songs-list-row__song-name-wrapper")
            .toArray()
            .map(x => ({
                title: cheerio.load(x)(".songs-list-row__song-name").text().trim(),
                artist: cheerio.load(x)(".songs-list-row__by-line").text().trim()
            }));
        return {
            tracks: trackName.map(x => AppleMusic.convertToUnresolved(x)),
            name: $(".product-name").eq(0).text()
                .trim()
        };
    }

    private async getTrack(url: string) {
        const html = await fetch(url).text();
        const $ = cheerio.load(html);
        const trackName = $(".artist-info")
            .toArray()
            .map(x => ({
                title: cheerio.load(x)(".video-name").text().trim(),
                artist: cheerio.load(x)(".video-artist-name").text().trim()
            }));
        return { tracks: trackName.map(x => AppleMusic.convertToUnresolved(x)) };
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
}
