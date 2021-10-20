import { ShoukakuTrack } from "shoukaku/types/Constants";
import { TrackUtils } from "./TrackUtils";

export class queueTrack extends Array<ShoukakuTrack> {
    public current: ShoukakuTrack | null = null;
    public previous: ShoukakuTrack | null = null;

    public add(track: (ShoukakuTrack) | (ShoukakuTrack)[]): void {
        if (!TrackUtils.validate(track)) {
            throw new RangeError('Track must be a "ShoukakuTrack" or "ShoukakuTrack[]".');
        }

        if (!this.current) {
            if (!Array.isArray(track)) {
                this.current = track;
                return;
            }
            this.current = (track = [...track]).shift()!;
        }

        if (track instanceof Array) this.push(...track);
        else this.push(track);
    }

    public get size() {
        return this.length;
    }

    public get totalSize(): number {
        return this.length + (this.current ? 1 : 0);
    }

    public getTrack(base64: string): ShoukakuTrack | undefined {
        return this.current?.track === base64 ? this.current : this.filter(x => x.track === base64)[0];
    }

    public clear(): void {
        this.splice(0);
    }

    public shuffle(): void {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
    }
}
