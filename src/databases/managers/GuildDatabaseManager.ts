import { Snowflake } from "discord-api-types";
import { getMongoRepository, MongoRepository } from "typeorm";
import { config } from "../../utils/parsedConfig";
import { GuildSetting } from "../entities/Guild";

export class GuildDatabaseManager {
    public repository!: MongoRepository<GuildSetting>;
    
    public _init() {
        this.repository = getMongoRepository(GuildSetting);
    }

    public async get(id: Snowflake): Promise<GuildSetting> {
        const data = await this.repository?.findOne({ id }, { cache: { id, milliseconds: config.maxDatabaseCacheLifetime } } );
        if(!data) {
            const createdData = this.repository?.create({ id })
            await this.repository?.save(createdData);
            return createdData;
        }
        return data;
    }

    public async set(id: Snowflake, key: keyof GuildSetting, value: any): Promise<GuildSetting> {
        const data = (await this.repository?.findOne({ id }, { cache: true })) ?? this.repository?.create({ id });
        // @ts-ignore
        data[key] = value;
        await this.repository?.save(data);
        return data;
    }
}