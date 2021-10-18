import { GuildTextBasedChannelTypes, VoiceBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { SapphireClient } from "@sapphire/framework";
import { Collection, Snowflake, User } from "discord.js";
import { EventEmitter } from "events";
import { Shoukaku } from "shoukaku";
import { lavalinkSource, ShoukakuTrack } from "../../types";
import { isURL } from "../../utils/isURL";
import { queueManager } from "./queueManager";

export class audioManager extends EventEmitter {
    public constructor(public shoukaku: Shoukaku, public client: SapphireClient) {
        super();
    }

    public queue: Collection<Snowflake, queueManager> = new Collection();

    public async resolveTrack(query: string, { requester, source = "youtube" }: { requester?: User; source?: lavalinkSource }) {
        const node = this.shoukaku.getNode();
        const searchTrack = await node.rest.resolve(query, isURL(query) ? undefined : source);
        if (searchTrack && (searchTrack.type === "TRACK" || searchTrack.type === "PLAYLIST" || searchTrack.type === "SEARCH")) {
            searchTrack.tracks = searchTrack.tracks.map(x => {
                (x as ShoukakuTrack).requester = requester;
                return x;
            });
        }
        return searchTrack ? searchTrack : null;
    }

    public async handleJoin(channel: VoiceBasedChannelTypes, textChannel: GuildTextBasedChannelTypes) {
        if (this.queue.has(channel.guildId)) return this.queue.get(channel.guildId)!;
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
