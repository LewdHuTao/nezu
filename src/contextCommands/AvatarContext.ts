import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandType } from "discord-api-types";
import { GuildContextMenuInteraction, MessageAttachment } from "discord.js";
import { ContextCommand, ContextCommandOptions } from "../libs/contexies/ContextCommandPiece";

@ApplyOptions<ContextCommandOptions>({
    name: "User avatar",
    type: ApplicationCommandType.User,
    defaultPermission: true
})
export class clientContext extends ContextCommand {
    public async messageRun(interaction: GuildContextMenuInteraction) {
        if (!interaction.replied && !interaction.deferred) await interaction.deferReply();
        const user = interaction.options.getUser("user", true);
        const messageAttachment = new MessageAttachment(user.avatarURL({ size: 4096, dynamic: true })!);
        return interaction.editReply({
            files: [messageAttachment]
        });
    }
}
