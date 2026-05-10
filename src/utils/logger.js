/* eslint-disable no-console */
const info = (...args) => console.log(...args);
const warn = (...args) => console.warn(...args);
const error = (...args) => console.error(...args);

const logger = { info, warn, error };

export default logger;
