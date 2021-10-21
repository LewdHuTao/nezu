import { Snowflake } from "discord.js";
import { Entity, Column, ObjectID, ObjectIdColumn, PrimaryColumn } from "typeorm";
import { ShoukakuTrack } from "../../types";

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
