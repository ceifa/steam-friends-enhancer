import { executeOnPageRealm } from "../injected/Proxy";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

declare global {
    interface Window {
        g_sessionID: string;
    }
}

const getSessionId = async () => {
    const sessionid = await executeOnPageRealm<string>(() => window.g_sessionID)
    if (!sessionid) {
        throw new Error('Steam session id not found');
    }

    return sessionid;
};

export const sendComments = async ({
    logger = console.log,
    steamids,
    comment
}: {
    logger?: (...args: string[]) => void,
    steamids: string[],
    comment: string
}) => {
    const sessionid = await getSessionId();

    logger(`Sending comment to ${steamids.length} friends:`, comment)

    let i = 0;

    // TODO: Split this function
    const send = (sid: string) => new Promise((resolve) => {
        const commentToSend = comment.replace(/\{name\}/g,
            document.querySelector(`[data-steamid='${sid}'] .friend_block_content`).childNodes[0].textContent);

        logger(`Sending to ${sid}: ${++i}`);

        $.ajax({
            url: `https://steamcommunity.com/comment/Profile/post/${sid}/-1/`,
            type: 'POST',
            data: {
                comment: commentToSend,
                count: commentToSend.length,
                sessionid,
                feature2: -1
            }
        }).fail(function (jqxhr) {
            logger("Failed to send to user " + sid);
        }).done(function (data) {
            if (data.success != 1) {
                logger("Failed to send to user " + sid);
            }
        }).always(resolve);
    });

    // TODO: Improve timers
    for (const sid of steamids) {
        if (i % 5 === 0) {
            await wait(15000);
        } else if (i % 6) {
            await wait(30000);
        }

        await send(sid);
        await wait(1000);
    }

    logger(`All sent. Success: ${i} ~ Failed ${steamids.length - i} ~ Tax: ${(i / steamids.length) * 100}%`);
};