import { wait } from "../helpers/Util";
import { getCurrentSessionId } from "../helpers/Steam";
import Logger from "../helpers/Logger";

export const sendComments = async ({
    steamids,
    comment
}: {
    steamids: string[],
    comment: string
}) => {
    const sessionid = await getCurrentSessionId();

    Logger.log(`Sending comment to ${steamids.length} friends:`, comment)

    let i = 0;

    // TODO: Split this function
    const send = (sid: string) => new Promise(async (resolve) => {
        const commentToSend = comment.replace(/\{name\}/g,
            document.querySelector(`[data-steamid='${sid}'] .friend_block_content`).childNodes[0].textContent);

        Logger.log(`Sending to ${sid}: ${++i}`);

        try {
            await fetch(`https://steamcommunity.com/comment/Profile/post/${sid}/-1/`, {
                method: 'POST',
                body: JSON.stringify({
                    comment: commentToSend,
                    count: commentToSend.length,
                    sessionid,
                    feature2: -1
                })
            }).then(resolve)
        } catch (e) {
            Logger.log("Failed to send to user " + sid);
        }
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

    Logger.log(`All sent. Success: ${i} ~ Failed ${steamids.length - i} ~ Tax: ${(i / steamids.length) * 100}%`);
};