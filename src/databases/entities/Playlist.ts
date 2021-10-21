import { Snowflake } from "discord.js";
import { Entity, Column, ObjectID, ObjectIdColumn, PrimaryColumn } from "typeorm";

@Entity({ name: "userPlaylists" })
export class PlaylistSetting {
    @ObjectIdColumn()
    public _id!: ObjectID;

    @PrimaryColumn("string")
    public userId!: Snowflake;

    @PrimaryColumn("string")
    public playlistId!: string;

    @Column("string")
    public playlistName!: string;
}

