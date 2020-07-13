import { wait, objectToFormData } from "../../helpers/Util";
import { getCurrentSessionId, sendLoadingAction } from "../../helpers/Steam";
import Logger from "../../helpers/Logger";
import FeatureBase from "../FeatureBase";

export class CommentSender extends FeatureBase {
    public start() {
        this.createCommentElement();
    }

    private createCommentElement() {
        const $manageButtonsContainer = document.querySelector('#manage_friends div:nth-child(2)') as HTMLElement;
        const $sendCommentButton = document.createElement("span");
        $sendCommentButton.className = "manage_action btnv6_lightblue_blue btn_medium";
        $sendCommentButton.innerHTML = "<span>Send comment</span>";
        $manageButtonsContainer.appendChild($sendCommentButton);

        const $postManageButtonsContainer = document.querySelector('#manage_friends div:nth-child(3)') as HTMLElement;
        $postManageButtonsContainer.setAttribute('style', 'display: none; padding-right: 16px; padding-bottom: 16px;');
        $postManageButtonsContainer.innerHTML = `
            <div class="commentthread_entry_quotebox">
                <textarea
                    id="post-comment-text" class="commentthread_textarea" placeholder="Add a comment"
                    style="overflow: hidden; height: 50px;"
                ></textarea>
            </div>
            <div class="commentthread_entry_submitlink">
                <span class="btn_green_white_innerfade btn_small">
                    <span id="post-comment-btn">Post Comment</span>
                </span>
            </div>
        `;

        $sendCommentButton.addEventListener('click', () => {
            $postManageButtonsContainer.style.display = $postManageButtonsContainer.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('post-comment-btn').addEventListener('click', async () => {
            const steamids: string[] = [];

            const $selectedProfiles = document.querySelectorAll('#search_results>.selectable.selected');
            $selectedProfiles.forEach(($el: HTMLElement) => {
                steamids.push($el.dataset.steamid);
            });

            const $comment = document.getElementById("post-comment-text") as HTMLInputElement;
            const comment = $comment.value;

            if (comment && steamids.length > 0) {
                await this.sendCommentsToFriends({
                    steamids,
                    comment
                });
            }
        });
    }

    private async sendCommentsToFriends({
        steamids,
        comment
    }: {
        steamids: string[],
        comment: string
    }) {
        const sessionid = await getCurrentSessionId();

        let total = steamids.length, sent = 0, failed = 0;

        const loading = await sendLoadingAction('Sending comments', 'Loading');

        Logger.log(`Sending comment to ${total} friends:`, comment)

        for (const sid of steamids) {
            try {
                const friendName = document.querySelector(`[data-steamid='${sid}'] .friend_block_content`).childNodes[0].textContent;
                const commentToSend = comment.replace(/\{name\}/g, friendName);

                sent++;

                Logger.log(`Sending to ${friendName}(${sid}) - ${sent}/${total}`);
                await loading.changeDescription(`Total: ${sent}/${total} ~ Success: ${total - failed} ~ Failed: ${failed}`);

                await this.sendComment(sid, commentToSend, sessionid);
            } catch {
                Logger.log("Failed to send to user " + sid);
                failed++;
            }

            await wait((5 + sent % 5 + Math.random() * 10) * 1000);
        }

        Logger.log(`All sent. Success: ${total - failed} ~ Failed: ${failed} ~ Tax: ${(total - failed) / total * 100}%`);
        await loading.close();
    };

    private async sendComment(sid: string, comment: string, sessionid: string) {
        var result = await fetch(`https://steamcommunity.com/comment/Profile/post/${sid}/-1/`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: objectToFormData({
                comment,
                count: comment.length,
                sessionid,
                feature2: -1
            })
        })

        var response: { success: boolean } = await result.json();
        if (response?.success !== true) {
            throw new Error('Comment request returned unsuccessful');
        }
    }
}









