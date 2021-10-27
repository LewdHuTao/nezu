import { Snowflake } from "discord-api-types";
import { getMongoRepository, MongoRepository } from "typeorm";
import { config } from "../../utils/parsedConfig";
import { GuildSetting } from "../entities/Guild";
import Keyv from "@keyvhq/core";
import KeyvRedis from "@keyvhq/redis";
export class GuildDatabaseManager {
    public repository!: MongoRepository<GuildSetting>;
    public cache = new Keyv({
        store: new KeyvRedis(config.redisUrl),
        namespace: "guildSettingCache"
    }) as unknown as Keyv<GuildSetting>;

    public _init() {
        this.repository = getMongoRepository(GuildSetting);
    }

    public async get(id: Snowflake): Promise<GuildSetting> {
        const cache = await this.cache.get(id);
        if (cache) return cache;
        const data = await this.repository.findOne({ id });
        if (!data) {
            const createdData = this.repository.create({ id });
            if (this.repository) await this.cache.set(id, createdData);
            await this.repository.save(createdData);
            return createdData;
        }
        if (this.repository) await this.cache.set(id, data, config.cacheLifeTime);
        return data;
    }

    public async set(id: Snowflake, key: keyof GuildSetting, value: any): Promise<GuildSetting> {
        const data = (await this.repository.findOne({ id })) ?? this.repository.create({ id });
        // @ts-expect-error
        data[key] = value;
        await this.repository.save(data);
        if (this.repository) await this.cache.set(id, data, config.cacheLifeTime);
        return data;
    }

    public async delete(id: Snowflake) {
        await this.repository.deleteOne({ id });
        return this.cache.delete(id);
    }
}
