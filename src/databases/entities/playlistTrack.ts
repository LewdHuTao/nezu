import { Snowflake } from "discord.js";
import { ShoukakuTrack } from "shoukaku";
import { Entity, Column, ObjectID, ObjectIdColumn, PrimaryColumn } from "typeorm";

@Entity({ name: "playlistTracks" })
export class PlaylistTrackSetting {
    @ObjectIdColumn()
    public _id!: ObjectID;

    @PrimaryColumn("string")
    public userId!: Snowflake;

    @PrimaryColumn("string")
    public playlistId!: string;

    @PrimaryColumn("string")
    public trackId!: string;

    @Column("json")
    public track!: ShoukakuTrack;
}
