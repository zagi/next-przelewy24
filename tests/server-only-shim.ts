// Vitest stub for `server-only` — the real package throws when imported
// outside a React Server Component context (no `react-server` resolution
// condition). Tests run under node, so we replace it with a no-op.
export {};
