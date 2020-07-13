export const wait = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

export const objectToFormData = (target: { [key: string]: string | number }): string => {
    return Object.entries(target)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
};