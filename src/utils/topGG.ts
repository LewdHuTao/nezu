import { Api } from "@top-gg/sdk";
import { config } from "./parsedConfig";
export const topGG = new Api(config.topGGToken);
