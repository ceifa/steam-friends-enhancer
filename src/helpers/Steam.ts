import { executeOnPageRealm } from "../injected/Proxy";

type CModal = {
    Dismiss: () => void
}

declare global {
    interface Window {
        g_sessionID: string;
        ShowBlockingWaitDialog: (title: string, description: string) => CModal;
        ShowDialog: (title: string, description: string) => CModal;
        ShowPromptDialog: (
            title: string,
            description: string,
            okBtn: string,
            cancelBtn: string,
            _args: any,
            defaultValue: string
        ) => CModal;
        UpdateSelection: () => void;
        FE_currentModal: CModal;
        FE_GuessNameFallback?: string;
    }
}

export const getCurrentSessionId = async () => {
    const sessionid = await executeOnPageRealm<string>(() => window.g_sessionID)
    if (!sessionid) {
        throw new Error('Steam session id not found');
    }

    return sessionid;
};

export const sendPromptAction = (
    title: string,
    description: string,
    okBtn: string,
    cancelBtn: string,
    defaultValue: string
) => executeOnPageRealm<string>(() => {
        try {
            return window.ShowPromptDialog(
                '{{title}}', '{{description}}', '{{okBtn}}', '{{cancelBtn}}', undefined, '{{defaultValue}}');
        } catch {
            return undefined;
        }
    }, { title, description, okBtn, cancelBtn, defaultValue });

export const sendDialog = (title: string, description: string) => executeOnPageRealm<void>(() => {
    try {
        return window.ShowDialog('{{title}}', '{{description}}');
    } catch {
        return undefined;
    }
}, { title, description });

export const sendLoadingAction = async (title: string, description: string): Promise<{
    changeDescription: (newDescription: string) => void,
    close: () => Promise<void>
}> => {
    await executeOnPageRealm<void>(() => {
        window.FE_currentModal = window.ShowBlockingWaitDialog(
            '{{title}}',
            '<span id="fe-modal-description">{{description}}</span>');
    }, { title, description });

    return {
        changeDescription: (newDescription: string) => {
            document.getElementById('fe-modal-description').innerText = newDescription;
        },
        close: () => executeOnPageRealm<void>(() => {
            window.FE_currentModal.Dismiss();
            window.FE_currentModal = undefined;
        })
    };
};