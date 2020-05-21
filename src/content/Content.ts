import $ from 'jquery';
import { executeOnPageRealm } from './Proxy';

declare global {
    interface Window {
        g_sessionID: string;
    }
}

if (!document.getElementById("send-comment")) {
    const manageButtons = document.getElementById("manage_friends").childNodes[3];
    const newBtn = document.createElement("span");
    newBtn.className = "manage_action btnv6_lightblue_blue btn_medium";
    newBtn.innerHTML = "<span>Send comment</span>";
    newBtn.id = "send-comment";
    manageButtons.appendChild(newBtn);

    const manageButtons2 = document.getElementById("manage_friends").childNodes[5];
    const textarea = document.createElement("div");
    textarea.innerHTML = `
    <div class="commentthread_entry_quotebox">
        <textarea class="commentthread_textarea" id="comment" placeholder="Comment" style="overflow: hidden; height: 50px;"></textarea>
    </div>
    `;
    manageButtons2.appendChild(textarea);

    newBtn.onclick = async () => {
        const steamids: string[] = [];
        $("#search_results>.selectable.selected:visible").each(function (i: number, ele: HTMLElement) {
            steamids.push($(ele).data('steamid'));
        });

        const comment = (document.getElementById("comment") as HTMLInputElement).value;
        
        const sessionScript = Array.from(document.getElementsByTagName("script"))
            .find(s => s.innerText.includes("g_sessionID"))
            .innerText;

        const sessionid = sessionScript.slice(0, sessionScript.indexOf(';')).match(/\".*\"/)[0].replace(/"/g, "");

        if (comment && sessionid) {
            console.log(`Sending that comment to ${steamids.length} users:\n\n${comment}`)

            let i = 0;

            const send = (sid: string) => new Promise((resolve) => {
                const commentToSend = comment.replace(/\{name\}/g,
                    document.querySelector(`[data-steamid='${sid}'] .friend_block_content`).childNodes[0].textContent);

                console.log(`Sending to ${sid}: ${++i}`);

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
                    console.log("Failed to send to user " + sid);
                }).done(function (data) {
                    if (data.success != 1) {
                        console.log("Failed to send to user " + sid);
                    }
                }).always(resolve);
            });

            for (const sid of steamids) {
                if (i % 5 === 0) {
                    await wait(15000);
                } else if (i % 6) {
                    await wait(30000);
                }

                await send(sid);
                await wait(1000);
            }

            console.log(`All sent. Success: ${i} ~ Failed ${steamids.length - i} ~ Tax: ${(i / steamids.length) * 100}%`);
        }
    }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));