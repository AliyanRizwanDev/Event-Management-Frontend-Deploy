const route = (process.env.REACT_APP_API_ROUTE || "http://localhost:8050").trim();

// Avoid double slashes when concatenating endpoint paths in axios calls.
export const API_ROUTE = route.replace(/\/$/, "");
