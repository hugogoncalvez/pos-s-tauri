export const debounce = (func, delay = 500) => {
    let timeoutId;
    let lastArgs; // To store the last arguments passed to the debounced function

    const debounced = (...args) => {
        lastArgs = args; // Store the arguments
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...lastArgs); // Use lastArgs
        }, delay);
    };

    debounced.cancel = () => {
        clearTimeout(timeoutId);
        timeoutId = null; // Clear timeoutId after cancelling
    };

    debounced.flush = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            func(...lastArgs);
            timeoutId = null; // Clear timeoutId after execution
        }
    };

    return debounced;
};
