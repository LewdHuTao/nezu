import { GuildTextBasedChannelTypes, VoiceBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { SapphireClient } from "@sapphire/framework";
import { Collection, Snowflake, User } from "discord.js";
import { EventEmitter } from "events";
import { Constants, Shoukaku } from "shoukaku";
import { Base64String, LavalinkSource } from "shoukaku/types";
import { isURL } from "../../utils/isURL";
import { queueManager } from "./queueManager";
import { Plugin } from "./utils/Plugin";

export class audioManager extends EventEmitter {
    public plugins: Plugin[];
    public shoukaku: Shoukaku;
    public constructor(public client: SapphireClient, { plugins }: { plugins?: Plugin[] }) {
        super();
        if (plugins) {
            for (const [index, plugin] of plugins.entries()) {
                if (!(plugin instanceof Plugin)) { throw new RangeError(`Plugin at index ${index} does not extend Plugin.`); }
                plugin.load(this);
            }
        }
        this.shoukaku = client.shoukaku;
        this.plugins = plugins ?? [];
    }

    public queue: Collection<Snowflake, queueManager> = new Collection();

    public async resolveTrack(query: string, options?: { requester?: User; source?: LavalinkSource }) {
        const node = this.shoukaku.getNode();
        const searchTrack = await node.rest.resolve(query, isURL(query) ? undefined : options?.source ?? "youtube");
        if (searchTrack && options?.requester !== undefined && (searchTrack.type === "TRACK" || searchTrack.type === "PLAYLIST" || searchTrack.type === "SEARCH")) {
            searchTrack.tracks = searchTrack.tracks.map(x => {
                x.requester = options?.requester;
                return x;
            });
        }
        return searchTrack ? searchTrack : null;
    }

    public async handleJoin(channel: VoiceBasedChannelTypes, textChannel: GuildTextBasedChannelTypes) {
        if (this.queue.has(channel.guildId)) {
            if (this.queue.get(channel.guildId)?.shoukakuPlayer.connection.state === Constants.state.CONNECTED) return this.queue.get(channel.guildId)!;
            if (this.queue.get(channel.guildId)?.shoukakuPlayer.connection.state !== Constants.state.CONNECTED) {
                const player = await this.shoukaku.getNode().joinChannel({
                    channelId: channel.id,
                    guildId: channel.guildId,
                    shardId: channel.guild?.shardId,
                    deaf: true
                });
                const oldQueue = this.queue.get(channel.guildId)!;
                const queue = new queueManager(this, player, textChannel);
                queue.queueLoop = oldQueue.queueLoop;
                queue.queueTrack = oldQueue.queueTrack;
                queue.lastMessage = oldQueue.lastMessage;
                queue.textChannel = oldQueue.textChannel;
                queue.trackLoop = oldQueue.trackLoop;
                this.queue.set(channel.guildId, queue);
                return queue;
            }
        }
        const player = await this.shoukaku.getNode().joinChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            shardId: channel.guild?.shardId,
            deaf: true
        });
        const queue = new queueManager(this, player, textChannel);
        this.queue.set(channel.guildId, queue);
        return queue;
    }
}

declare module "shoukaku" {
    export class ShoukakuTrack {
        requester: User | undefined;
        track: Base64String;
        info: {
            identifier?: string;
            isSeekable?: boolean;
            author?: string;
            length?: number;
            isStream?: boolean;
            position?: number;
            title?: string;
            uri?: string;
        };
    }
}
