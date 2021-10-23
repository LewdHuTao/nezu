import * as Sentry from "@sentry/node";
import { config } from "./parsedConfig";

Sentry.init({
    dsn: config.dsnUrl,
    tracesSampleRate: 1.0
});

export const sentryNode = Sentry;
export function transaction(op: string, name: string) {
    Sentry.startTransaction({
        op,
        name
    }).finish();
}
