/**
 * Application config — reads Vite env vars, validates them at startup.
 *
 * Vite exposes env vars prefixed with VITE_* on `import.meta.env`. They're
 * inlined into the bundle at build time, so they're visible in the browser.
 * That's fine for the API URL; it's a known limitation for VITE_API_KEY
 * (anyone who opens DevTools can read it). Acceptable for an internal tool;
 * NOT acceptable if this ever goes public — at which point the architecture
 * changes (per-user auth tokens, backend-issued).
 */

type Config = {
  apiUrl: string;
  apiKey: string | null;
};

function loadConfig(): Config {
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiUrl) {
    throw new Error(
      "VITE_API_URL is not set. Copy .env.example to .env and configure it.",
    );
  }

  // Strip trailing slash so we can compose URLs cleanly: `${apiUrl}/api/health`
  const normalizedUrl = apiUrl.replace(/\/$/, "");

  return {
    apiUrl: normalizedUrl,
    apiKey: apiKey || null, // empty string → null; auth-disabled is a real state
  };
}

export const config = loadConfig();
