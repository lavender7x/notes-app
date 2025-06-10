let callbacks: Function[] = [];

export const subscribeToUrlChange = (cb: Function) => {
    callbacks.push(cb);
}

export const unsubscribeFromUrlChange = (cb: Function) => {
    callbacks = callbacks.filter(callback => callback !== cb);
}

export function registerUrlListener() {
    const origPushState = history.pushState;

    history.pushState = function () {
        // @ts-ignore
        origPushState.apply(history, arguments);
        callbacks.forEach(cb => cb());
    };
}
