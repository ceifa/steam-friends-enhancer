const resolvers: { [identifier: string]: (result?: any) => void } = {};
let isInitialized: boolean = false;

const initializeIfNeeded = () => {
    if (!isInitialized) {
        isInitialized = true;

        window.addEventListener("message", (message: MessageEvent) => {
            const identifier = message?.data?.identifier;
            if (identifier) {
                // It's the request, should not handle
                if (!message.data.result && !message.data.error) {
                    return;
                }

                try {
                    resolvers[identifier](message.data.result);
                } finally {
                    delete resolvers[identifier];
                }
            }
        });

        const injectedScript = document.createElement("script");
        injectedScript.src = (chrome || browser).extension.getURL("js/injected.js");

        try {
            return new Promise(resolve => injectedScript.addEventListener("load", resolve));
        } finally {
            document.head.appendChild(injectedScript);
        }
    }

    return Promise.resolve();
};

export const executeOnPageRealm = <T>(func: Function, args: { [key: string]: string } = {}): Promise<T> =>
    new Promise(async resolve => {
        await initializeIfNeeded();

        const identifier = Math.random().toString(36).substr(2, 9);
        resolvers[identifier] = resolve;

        const funcToExecute = Object.entries(args).reduce((prev, [key, value]) =>
            prev.replace(new RegExp(`{{${key}}}`, 'g'), value == null ? '' : value), func.toString());

        window.postMessage({
            identifier: identifier,
            script: funcToExecute,
        }, '*');
    });