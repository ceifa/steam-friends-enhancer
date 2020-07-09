import { executeOnPageRealm } from "../injected/Proxy";

declare global {
    interface Window {
        g_sessionID: string;
    }
}

export const getCurrentSessionId = async () => {
    const sessionid = await executeOnPageRealm<string>(() => window.g_sessionID)
    if (!sessionid) {
        throw new Error('Steam session id not found');
    }

    return sessionid;
};