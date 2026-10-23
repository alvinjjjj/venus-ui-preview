// The preview only talks to real contracts when it runs on the local dev server
// (127.0.0.1 / localhost). Deployed previews (Vercel) keep every action simulated.
export const isLocalPreview =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  ['127.0.0.1', 'localhost'].includes(window.location.hostname);
