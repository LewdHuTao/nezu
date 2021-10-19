import { audioManager } from "../audioManager";

export abstract class Plugin {
    public abstract name: string;
    public abstract load(manager: audioManager): void;

    public abstract unload(manager: audioManager): void;
}
