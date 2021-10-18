import { ShoukakuTrack } from "shoukaku/types/Constants";

export class TrackUtils {
    public static isUnresolved(track: any) {
        if (!(track.track || track.info.title || track.info.author || track.info.length)) return false;
        return true;
    }

    public static validate(trackOrTracks: (ShoukakuTrack) | (ShoukakuTrack)[]) {
        if (Array.isArray(trackOrTracks)) {
            for (const track of trackOrTracks) {
                if (!(track.track || track.info.title || track.info.author || track.info.length)) return false;
            }
        } else if (!trackOrTracks.track || !trackOrTracks.info.title || !trackOrTracks.info.author || !trackOrTracks.info.length) { return false; } else { return true; }
    }
}
