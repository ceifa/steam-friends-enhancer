window.addEventListener("message", (message: MessageEvent) => {
    const identifier = message?.data?.identifier;
    if (identifier) {
        // It's the response, should not handle
        if (message.data.result || message.data.error) {
            return;
        }

        const fn = Function('return ' + message.data.script)();
        const response: any = {
            identifier: message.data.identifier
        };

        try {
            response.result = fn();
        } catch (e) {
            response.error = e.message;
        }

        window.postMessage(response, "*");
    }
});
