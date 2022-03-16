import FeatureBase from "../FeatureBase";
import { sendPromptAction } from "../../helpers/Steam";
import { executeOnPageRealm } from "../../injected/Proxy";

export class FriendSelector extends FeatureBase {
    public start(): void {
        this.addButton();
    }

    private addButton() {
        const $manageButtonsContainer = document.querySelector('#manage_friends div:nth-child(2)') as HTMLElement;
        const $sendCommentButton = document.createElement("span");
        $sendCommentButton.className = "manage_action btnv6_lightblue_blue btn_medium";
        $sendCommentButton.innerHTML = "<span>Select by offline days</span>";
        $sendCommentButton.onclick = async ev => {
            const input = await sendPromptAction(undefined, 'Time in days', 'Select', undefined, '1');
            const days = parseInt(input);

            Array.from(document.querySelectorAll('#search_results>.selectable'))
                .map(($el: HTMLElement) => ({
                    element: $el,
                    days: parseInt($el.querySelector('.friend_last_online_text')?.textContent.match(/\d+ days/g)?.[0])
                }))
                .filter(({ days: offDays }) => !isNaN(offDays) && offDays >= days)
                .forEach(async ({ element }) => {
                    const selectable: HTMLInputElement = element.querySelector('.select_friend_checkbox');
                    element.classList.add('selected')
                    selectable.checked = true;

                    await executeOnPageRealm(() => {
                        window.UpdateSelection();
                    });
                });
        };

        $manageButtonsContainer.appendChild($sendCommentButton);
    }
}