import { dev } from '$app/environment';

/** Development-only logging. No-ops in production builds. */
export const debug = dev ? console.debug.bind(console) : () => {};
