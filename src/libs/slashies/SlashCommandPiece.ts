import { Piece, PieceContext } from "@sapphire/framework";
import { Awaitable } from "@sapphire/utilities";
import { ApplicationCommandOptionData, BaseGuildCommandInteraction, CommandInteraction } from "discord.js";

export abstract class SlashCommand extends Piece {
    constructor(context: PieceContext, public options: SlashCommandOptions) {
        super(context, options);
    }

    public abstract messageRun(interaction: BaseGuildCommandInteraction<"present"> & CommandInteraction): Awaitable<unknown>;
}

export interface SlashCommandOptions {
    defaultPermission: boolean;
    name: string;
    description: string;
    options?: ApplicationCommandOptionData[];
}
