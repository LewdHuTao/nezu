import { queueManager } from "./queueManager";

export class filterManager {
    constructor(public queueManager: queueManager) { }
    public status = {
        nightcore: false,
        daycore: false,
        vaporwave: false,
        pop: false,
        soft: false,
        trebblebass: false,
        eightD: false,
        karaoke: false,
        vibrato: false,
        earrape: false,
        tremolo: false,
        distortion: false
    };

    public setNightcore(status = true) {
        if (!status) {
            this.status.nightcore = false;
            this.queueManager.shoukakuPlayer.setTimescale(null);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.nightcore = true;
        this.queueManager.shoukakuPlayer.setTimescale({ speed: 1.0, pitch: 1.2, rate: 1.0 });
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setDaycore(status = true) {
        if (!status) {
            this.status.daycore = false;
            this.queueManager.shoukakuPlayer.setTimescale(null);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.daycore = true;
        this.status.nightcore = true;
        this.queueManager.shoukakuPlayer.setTimescale({ speed: 1.0, rate: 1.0, pitch: 0.9 });
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setEightD(status = true) {
        if (!status) {
            this.status.eightD = false;
            this.queueManager.shoukakuPlayer.setRotation(null);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.eightD = true;
        this.queueManager.shoukakuPlayer.setRotation({ rotationHz: 0.2 });
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setDistortion(status = true) {
        if (!status) {
            this.status.distortion = false;
            this.queueManager.shoukakuPlayer.setDistortion(null);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.distortion = true;
        this.queueManager.shoukakuPlayer.setDistortion({ sinOffset: 0, sinScale: 1, cosOffset: 0, cosScale: 1, tanOffset: 0, tanScale: 1, offset: 0, scale: 1 });
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setEarrape(status = true) {
        if (!status) {
            this.status.earrape = false;
            this.queueManager.shoukakuPlayer.setEqualizer([]);
            this.queueManager.shoukakuPlayer.setVolume(100);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.earrape = true;
        this.status.pop = false;
        this.status.trebblebass = false;
        this.queueManager.shoukakuPlayer.setEqualizer([...Array(6).fill(0).map((n, i) => ({ band: i, gain: 0.5 }))]);
        this.queueManager.shoukakuPlayer.setVolume(500);
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setKaraoke(status = true) {
        if (!status) {
            this.status.karaoke = false;
            this.queueManager.shoukakuPlayer.setKaraoke(null);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.karaoke = true;
        this.queueManager.shoukakuPlayer.setKaraoke({ level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 });
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setPop(status = true) {
        if (!status) {
            this.status.karaoke = false;
            this.queueManager.shoukakuPlayer.setEqualizer([]);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.pop = true;
        if (this.status.earrape) this.queueManager.shoukakuPlayer.setVolume(100);
        this.status.earrape = false;
        this.status.trebblebass = false;
        this.status.vaporwave = false;
        this.queueManager.shoukakuPlayer.setEqualizer([
            { band: 0, gain: 0.65 }, { band: 1, gain: 0.45 },
            { band: 2, gain: -0.45 }, { band: 3, gain: -0.65 },
            { band: 4, gain: -0.35 }, { band: 5, gain: 0.45 },
            { band: 6, gain: 0.55 }, { band: 7, gain: 0.6 },
            { band: 8, gain: 0.6 }, { band: 9, gain: 0.6 },
            { band: 10, gain: 0 }, { band: 11, gain: 0 },
            { band: 12, gain: 0 }, { band: 13, gain: 0 }
        ]);
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setTrebbleBass(status = true) {
        if (!status) {
            this.status.karaoke = false;
            this.queueManager.shoukakuPlayer.setEqualizer([]);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.trebblebass = true;
        if (this.status.earrape) this.queueManager.shoukakuPlayer.setVolume(100);
        this.status.earrape = false;
        this.status.pop = false;
        this.queueManager.shoukakuPlayer.setEqualizer([
            { band: 0, gain: 0.6 }, { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 }, { band: 3, gain: 0 },
            { band: 4, gain: -0.5 }, { band: 5, gain: 0.15 },
            { band: 6, gain: -0.45 }, { band: 7, gain: 0.23 },
            { band: 8, gain: 0.35 }, { band: 9, gain: 0.45 },
            { band: 10, gain: 0.55 }, { band: 11, gain: 0.6 },
            { band: 12, gain: 0.55 }, { band: 13, gain: 0 }
        ]);
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setTremolo(status = true) {
        if (!status) {
            this.status.tremolo = false;
            this.queueManager.shoukakuPlayer.setTremolo(null);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.tremolo = true;
        this.status.vaporwave = false;
        this.queueManager.shoukakuPlayer.setTremolo({ frequency: 2.0, depth: 0.5 });
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setVaporwave(status = true) {
        if (!status) {
            this.status.vaporwave = false;
            this.queueManager.shoukakuPlayer.setTimescale(null);
            this.queueManager.shoukakuPlayer.setTremolo(null);
            this.queueManager.shoukakuPlayer.setEqualizer([]);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        if (this.status.earrape) this.queueManager.shoukakuPlayer.setVolume(100);
        this.status.tremolo = false;
        this.status.nightcore = false;
        this.status.daycore = false;
        this.status.trebblebass = false;
        this.status.pop = false;
        this.status.earrape = false;
        this.queueManager.shoukakuPlayer.setTimescale({ speed: 1.0, rate: 1.0, pitch: 0.5 });
        this.queueManager.shoukakuPlayer.setTremolo({ depth: 0.3, frequency: 14 });
        this.queueManager.shoukakuPlayer.setEqualizer([{ band: 1, gain: 0.3 }, { band: 0, gain: 0.3 }]);
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setVibrato(status = true) {
        if (!status) {
            this.status.vibrato = false;
            this.queueManager.shoukakuPlayer.setVibrato(null);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.vibrato = true;
        this.queueManager.shoukakuPlayer.setVibrato({ depth: 1, frequency: 14 });
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public setSoft(status = true) {
        if (!status) {
            this.status.soft = false;
            this.queueManager.shoukakuPlayer.setLowPass(null);
            return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
        }
        this.status.soft = true;
        this.queueManager.shoukakuPlayer.setLowPass({ smoothing: 20.0 });
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }

    public clearFilters() {
        this.status = {
            nightcore: false,
            daycore: false,
            vaporwave: false,
            pop: false,
            soft: false,
            trebblebass: false,
            eightD: false,
            karaoke: false,
            vibrato: false,
            earrape: false,
            tremolo: false,
            distortion: false
        };

        this.queueManager.shoukakuPlayer.clearFilters();
        return this.queueManager.shoukakuPlayer.seekTo(this.queueManager.shoukakuPlayer.position);
    }
}
