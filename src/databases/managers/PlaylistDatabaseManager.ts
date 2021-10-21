import { Snowflake } from "discord-api-types";
import { getMongoRepository, MongoRepository } from "typeorm";
import { config } from "../../utils/parsedConfig";
import { Cheshire } from "cheshire";
import { PlaylistSetting } from "../entities/Playlist";
import crypto from "crypto";

export class PlaylistDatabaseManager {
    public repository!: MongoRepository<PlaylistSetting>;
    public cache: Cheshire<Snowflake, PlaylistSetting> = new Cheshire({ lifetime: config.cacheLifeTime });

    public _init() {
        this.repository = getMongoRepository(PlaylistSetting);
    }

    public async resolvePlaylist(userId: Snowflake, playlistIdOrName: string): Promise<PlaylistSetting | undefined> {
        if (this.cache.filter(x => x.userId === userId && x.playlistId === playlistIdOrName).size) return this.cache.filter(x => x.userId === userId && x.playlistId === playlistIdOrName).first();
        if (this.cache.filter(x => x.userId === userId && x.playlistName === playlistIdOrName).size) return this.cache.filter(x => x.userId === userId && x.playlistName === playlistIdOrName).first();
        const findWithId = await this.repository.findOne({ userId, playlistId: playlistIdOrName });
        if (findWithId) {
            this.cache.set(findWithId.playlistId, findWithId);
            return findWithId;
        }
        const findWithName = await this.repository.findOne({ userId, playlistName: playlistIdOrName });
        if (findWithName) {
            this.cache.set(findWithName.playlistId, findWithName);
            return findWithName;
        }
        return undefined;
    }

    public async getUserPlaylist(userId: Snowflake) {
        if (this.cache.filter(x => x.userId === userId).size) return [...this.cache.filter(x => x.userId === userId).values()];
        return this.repository.find({ userId });
    }

    public async createPlaylist(userId: Snowflake, playlistName: string): Promise<PlaylistSetting> {
        const createdData = this.repository.create({ userId, playlistName, playlistId: crypto.randomBytes(4).toString("hex") });
        await this.repository.save(createdData);
        this.cache.set(createdData.playlistId, createdData);
        return createdData;
    }

    public async delete(userId: Snowflake, playlistName: string) {
        await this.repository.deleteOne({ userId, playlistName });
        return this.cache.delete(userId);
    }
}
