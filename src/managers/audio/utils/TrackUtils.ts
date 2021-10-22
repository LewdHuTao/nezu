import { ShoukakuTrack } from "shoukaku";

export class TrackUtils {
    public static isUnresolved(track: any) {
        if (!track.track && track.info.title && track.info.author && track.info.length) return true;
        return false;
    }

    public static validate(trackOrTracks: (ShoukakuTrack) | (ShoukakuTrack)[]) {
        if (Array.isArray(trackOrTracks)) {
            for (const track of trackOrTracks) {
                if (track.info.title && track.info.author && track.info.length) return true;
            }
        } else if (trackOrTracks.info.title && trackOrTracks.info.author && trackOrTracks.info.length) { return true; } else { return false; }
    }
}
