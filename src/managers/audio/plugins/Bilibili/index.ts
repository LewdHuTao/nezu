import { User } from "discord.js";
// @ts-expect-error Shoukaku type problem
import { ShoukakuTrackList } from "shoukaku";
import { ShoukakuTrackList as ShoukakuTrackListType } from "shoukaku/types/Constants";
import { lavalinkSource, ShoukakuTrack } from "../../../../types";
import { audioManager } from "../../audioManager";
import { Plugin } from "../../utils/Plugin";
import fetch from "petitio";
import { Cheshire } from "cheshire/src/Cheshire";
import { config } from "../../../../utils/parsedConfig";
export class Bilibili extends Plugin {
    public name = "Bilibili";
    public regex = /(?:http:\/\/|https:\/\/|)((www.)|(m.))bilibili.com\/(video)[/:]([A-Za-z0-9]+)/;
    public manager!: audioManager;
    private _resolveTrack!: (query: string, { requester, source }: { requester?: User; source?: lavalinkSource }) => Promise<ShoukakuTrackList | null>;
    public cache: Cheshire<string, any> = new Cheshire({ lifetime: config.cacheLifeTime });

    private readonly functions = {
        video: this.getVideo.bind(this)
    };

    public load(manager: audioManager) {
        this.manager = manager;
        this._resolveTrack = manager.resolveTrack.bind(manager);
        manager.resolveTrack = this.resolveTrack.bind(this);
    }

    private async resolveTrack(query: string, { requester, source }: { requester?: User; source?: lavalinkSource }): Promise<ShoukakuTrackList | null> {
        const [, , , , type, id] = this.regex.exec(query) ?? [];
        if (type in this.functions) {
            try {
                const func = this.functions[type as keyof Bilibili["functions"]];
                const searchTrack: ShoukakuTrackListType | null = await func(id, requester);
                if (searchTrack && (searchTrack.type === "TRACK" || searchTrack.type === "PLAYLIST" || searchTrack.type === "SEARCH")) {
                    searchTrack.tracks = searchTrack.tracks.map(x => {
                        (x as ShoukakuTrack).requester = requester;
                        return x;
                    });
                }
                return searchTrack;
            } catch (e) {
                return null;
            }
        }

        return this._resolveTrack(query, { requester, source });
    }

    private async getVideo(videoId: string, requester: User | undefined): Promise<ShoukakuTrackList | null> {
        if (this.cache.has(videoId)) return new ShoukakuTrackList({ loadType: "TRACK_LOADED", playlistInfo: {}, tracks: [this.cache.get(videoId)] });
        const { data: videoInfo } = await fetch("https://api.bilibili.com/x/web-interface/view").query("bvid", videoId).json();

        const { data: playerInfo } = await fetch("https://api.bilibili.com/x/player/playurl").query("bvid", videoId).query("cid", videoInfo.cid)
            .query("qn", 0)
            .query("fnval", 80)
            .query("fnver", 0)
            .query("fourk", 1)
            .json();

        const retriveTrack = await this.manager.resolveTrack(playerInfo.dash.audio[0].base_url as string, { requester });
        if (!retriveTrack || retriveTrack.type === "LOAD_FAILED" || retriveTrack.type === "NO_MATCHES") {
            return retriveTrack;
        }

        const newTrackMeta = {
            track: retriveTrack.tracks[0].track,
            info: {
                isStream: retriveTrack.tracks[0].info.isStream,
                isSeekable: retriveTrack.tracks[0].info.isSeekable,
                title: videoInfo.title,
                author: videoInfo.owner.name,
                length: videoInfo.duration * 1000,
                uri: `https://www.bilibili.com/video/${videoId}`,
                identifier: retriveTrack.tracks[0].info.identifier
            }
        };
        this.cache.set(videoId, newTrackMeta);
        return new ShoukakuTrackList({ loadType: "TRACK_LOADED", playlistInfo: {}, tracks: [newTrackMeta] });
    }

    public unload(manager: audioManager) {
        return manager.plugins?.filter(x => x.name === this.name).shift();
    }
}
