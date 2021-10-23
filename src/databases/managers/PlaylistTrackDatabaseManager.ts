import { Snowflake } from "discord-api-types";
import { getMongoRepository, MongoRepository } from "typeorm";
import { config } from "../../utils/parsedConfig";
import { PlaylistTrackSetting } from "../entities/playlistTrack";
import { ShoukakuTrack } from "shoukaku";
import crypto from "crypto";
import Collection from "@discordjs/collection";

export class PlaylistTrackDatabaseManager {
    public repository!: MongoRepository<PlaylistTrackSetting>;
    public cache: Collection<Snowflake, PlaylistTrackSetting> = new Collection();

    public _init() {
        this.repository = getMongoRepository(PlaylistTrackSetting);
        setInterval(() => this.cache.clear(), config.cacheLifeTime)
    }

    public async createTrack(userId: Snowflake, playlistId: string, track: ShoukakuTrack): Promise<PlaylistTrackSetting> {
        const createdTrack = this.repository.create({ userId, playlistId, track, trackId: crypto.randomBytes(4).toString("hex") });
        await this.repository.save(createdTrack);
        this.cache.set(createdTrack.trackId, createdTrack);
        return createdTrack;
    }

    public getTrack(userId: Snowflake, playlistId: string) {
        if (this.cache.filter(x => x.userId === userId && x.playlistId === playlistId).size) return [...this.cache.filter(x => x.userId === userId && x.playlistId === playlistId).values()];
        return this.repository.find({ userId, playlistId });
    }

    public getSIngleTrack(userId: Snowflake, trackId: string) {
        if (this.cache.filter(x => x.userId === userId && x.trackId === trackId).size) return this.cache.filter(x => x.userId === userId && x.trackId === trackId).first();
        return this.repository.findOne({ userId, trackId });
    }

    public async delete(userId: Snowflake, trackId: string) {
        await this.repository.deleteOne({ userId, trackId });
        return this.cache.delete(trackId);
    }
}
