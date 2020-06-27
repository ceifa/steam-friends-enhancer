import { sendComments } from './CommentSender';
import $ from 'jquery';

const manageButtonsContainer = document.querySelector('#manage_friends div:nth-child(2)') as HTMLElement;
const sendCommentButton = document.createElement("span");
sendCommentButton.className = "manage_action btnv6_lightblue_blue btn_medium";
sendCommentButton.innerHTML = "<span>Send comment</span>";
manageButtonsContainer.appendChild(sendCommentButton);

const postManageButtonsContainer = document.querySelector('#manage_friends div:nth-child(3)') as HTMLElement;
postManageButtonsContainer.setAttribute('style', 'display: none; padding-right: 16px; padding-bottom: 16px;');
postManageButtonsContainer.innerHTML = `
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

sendCommentButton.addEventListener('click', () => {
    postManageButtonsContainer.style.display = postManageButtonsContainer.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('post-comment-btn').addEventListener('click', async () => {
    const steamids: string[] = [];
    // TODO: Stop using jQuery
    $("#search_results>.selectable.selected:visible").each((i: number, ele: HTMLElement) => {
        steamids.push($(ele).data('steamid'));
    });

    const commentElement = document.getElementById("post-comment-text") as HTMLInputElement;
    const comment = commentElement.value;

    if (comment && steamids.length > 0) {
        await sendComments({
            steamids,
            comment
        });
    }
});