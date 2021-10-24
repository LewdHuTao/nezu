import { Piece, PieceContext } from "@sapphire/framework";
import { Awaitable } from "@sapphire/utilities";
import { ApplicationCommandType } from "discord-api-types";
import { GuildContextMenuInteraction } from "discord.js";

export abstract class ContextCommand extends Piece {
    constructor(context: PieceContext, public options: ContextCommandOptions) {
        super(context, options);
    }

    public abstract messageRun(interaction: GuildContextMenuInteraction): Awaitable<unknown>;
}

export interface ContextCommandOptions {
    defaultPermission: boolean;
    name: string;
    type: ApplicationCommandType.User | ApplicationCommandType.Message;
}
