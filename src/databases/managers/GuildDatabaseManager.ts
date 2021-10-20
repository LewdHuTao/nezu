import { Snowflake } from "discord-api-types";
import { getMongoRepository, MongoRepository } from "typeorm";
import { config } from "../../utils/parsedConfig";
import { GuildSetting } from "../entities/Guild";
import { Cheshire } from "cheshire";
export class GuildDatabaseManager {
    public repository!: MongoRepository<GuildSetting>;
    public cache: Cheshire<Snowflake, GuildSetting> = new Cheshire({ lifetime: config.cacheLifeTime });

    public _init() {
        this.repository = getMongoRepository(GuildSetting);
    }

    public async get(id: Snowflake): Promise<GuildSetting> {
        if (this.cache.get(id) !== undefined) return this.cache.get(id);
        const data = await this.repository.findOne({ id });
        if (!data) {
            const createdData = this.repository.create({ id });
            if (this.repository) this.cache.set(id, createdData);
            await this.repository.save(createdData);
            return createdData;
        }
        if (this.repository) this.cache.set(id, data);
        return data;
    }

    public async set(id: Snowflake, key: keyof GuildSetting, value: any): Promise<GuildSetting> {
        const data = (await this.repository.findOne({ id }, { cache: true })) ?? this.repository.create({ id });
        // @ts-expect-error
        data[key] = value;
        await this.repository.save(data);
        if (this.repository) this.cache.set(id, data);
        return data;
    }

    public async delete(id: Snowflake) {
        await this.repository.deleteOne({ id });
        return this.cache.delete(id);
    }
}
