import { executeOnPageRealm } from "../injected/Proxy";

type CModal = {
    Dismiss: () => void
}

declare global {
    interface Window {
        g_sessionID: string;
        ShowBlockingWaitDialog: (title: string, description: string) => CModal;
        FE_currentModal: CModal;
    }
}

export const getCurrentSessionId = async () => {
    const sessionid = await executeOnPageRealm<string>(() => window.g_sessionID)
    if (!sessionid) {
        throw new Error('Steam session id not found');
    }

    return sessionid;
};

export const sendLoadingAction = async (title: string, description: string): Promise<{
    changeDescription: (newDescription: string) => void,
    close: () => void
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
        close: async () => {
            await executeOnPageRealm<void>(() => {
                window.FE_currentModal.Dismiss();
                window.FE_currentModal = undefined;
            });
        }
    };
};