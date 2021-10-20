import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import ms from "ms";
import { inlineCode } from "@discordjs/builders";

@ApplyOptions<CommandOptions>({
    name: "search",
    description: "search track and add to the queue",
    preconditions: ["threadCondition", "onVoiceCondition", "onSameVoiceCondition"],
    requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
})

export class clientCommand extends Command {
    async messageRun(message: Message, args: Args) {
        const userArgument = await args.restResult("string");
        const audio = await this.container.client.audioManager.handleJoin(message.member?.voice.channel!, message.channel as GuildTextBasedChannelTypes);
        const track = await this.container.client.audioManager.resolveTrack(userArgument.value!, { requester: message.author });
        if (!track || track.type === "LOAD_FAILED" || track.type === "NO_MATCHES") {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`❌ | Result doesnot match search type`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
        } if (track.type === "PLAYLIST") {
            audio.queueTrack.add(track.tracks);
            await message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`✅ | Added \`${track.playlistName}\` to the queue`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
            if (audio?.queueTrack.totalSize === track.tracks.length) return audio?.play();
        } else if (track.type === "TRACK" || track.type === "SEARCH") {
            await message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`✅ | Added \`${track.tracks[0].info.title}\` to the queue`)
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
            audio.queueTrack.add(track.tracks[0]);
            if (!audio.shoukakuPlayer.paused && !audio.queueTrack.size && !audio.playing) return audio.play();
        } else {
            const row = new MessageActionRow();
            const selectMenu = new MessageSelectMenu().setCustomId("musicSelection");
            let currentCount = 0;
            for (const slicedTrack of track.tracks.slice(0, 10)) {
                selectMenu.addOptions({
                    label: slicedTrack.info.title!.length > 98 ? `${slicedTrack.info.title!.substr(0, 97)}...` : slicedTrack.info.title!,
                    value: String(currentCount++),
                    description: `${slicedTrack.info.author} - ${ms(slicedTrack.info.length!)}`
                });
            }
            row.addComponents(selectMenu);
            const collectMessage = await message.channel.send({
                components: [row],
                embeds: [
                    new MessageEmbed()
                        .setDescription("✅ | Select music between 1-10, you have 20 seconds to decide.")
                        .setColor("LUMINOUS_VIVID_PINK")
                ]
            });
            const collector = collectMessage.createMessageComponentCollector({
                filter: interaction => interaction.user.id === message.author.id,
                time: 20000
            });
            collector.on("collect", async interaction => {
                if (!interaction.isSelectMenu()) return;
                if (interaction.customId !== "musicSelection") return;
                await interaction.deferUpdate();
                const musicTrack = track.tracks[parseInt(interaction.values[0])];
                audio.queueTrack.add(musicTrack);
                if (!audio.playing && !audio.shoukakuPlayer.paused && !audio.queueTrack.size) {
                    await audio.play();
                }
                await collectMessage.edit({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`✅ Added ${inlineCode(musicTrack.info.title!)} to the queue`)
                            .setColor("LUMINOUS_VIVID_PINK")
                    ],
                    components: []
                });
                return collector.stop("selected");
            });
            collector.on("end", async (_, reason) => {
                if (reason !== "selected") {
                    await collectMessage.edit({
                        embeds: [
                            new MessageEmbed()
                                .setDescription("❌ | You didnt select requested track, track selection canceled")
                                .setColor("LUMINOUS_VIVID_PINK")
                        ],
                        components: []
                    });
                }
            });
        }
    }
}
