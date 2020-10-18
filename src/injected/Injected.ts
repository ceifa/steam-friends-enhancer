window.addEventListener("message", async (message: MessageEvent) => {
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
            var result = fn();
            if (result.then) {
                response.result = await result;
            } else {
                response.result = result;
            }
        } catch (e) {
            response.error = e?.message;
        }

        window.postMessage(response, "*");
    }
});
