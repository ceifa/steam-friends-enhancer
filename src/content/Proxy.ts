export const executeOnPageRealm = (func: Function) => new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
        type: 'execute-script',
        script: `console.log(window)`
    }, response => {
        return response?.error ? reject(response.error) : resolve(response);
    })
});