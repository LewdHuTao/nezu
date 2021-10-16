import { Snowflake } from "discord.js";
import { Entity, Column, ObjectID, ObjectIdColumn, PrimaryColumn } from "typeorm";

@Entity({ name: "guilds" })
export class GuildSetting {
    @ObjectIdColumn()
    public _id!: ObjectID;

    @PrimaryColumn("string")
    public id!: Snowflake;

    @Column("boolean")
    public enableFilter = true;

    @Column("string")
    public prefix = "+";

    @Column("string")
    public lng = "en-US";
}

