# next-przelewy24

Next.js 15+ App Router helpers for Przelewy24 (P24) — webhook Route Handler factory and Server Action checkout helper, both `server-only`-enforced.

[![npm version](https://img.shields.io/npm/v/next-przelewy24)](https://www.npmjs.com/package/next-przelewy24)
[![CI](https://github.com/zagi/next-przelewy24/actions/workflows/ci.yml/badge.svg)](https://github.com/zagi/next-przelewy24/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/next-przelewy24)](./LICENSE)

## Why this package

[`przelewy24-ts-sdk`](https://github.com/zagi/przelewy24-ts-sdk) is a runtime-agnostic SDK. `next-przelewy24` is a thin layer over it that fits the App Router shape:

- A `POST` factory for `app/api/p24/webhook/route.ts` that handles body parsing, signature verification, and the 200/400 split.
- A factory that wraps `client.registerTransaction` so you can expose it as a Server Action with one line.
- Every entry imports `'server-only'`, so accidentally importing the module from a client component fails the build instead of leaking secrets.

If you need anything beyond the webhook + checkout-action pair (refunds, card-charge, payment-methods, verify, etc.), call the underlying [`przelewy24-ts-sdk`](https://github.com/zagi/przelewy24-ts-sdk) directly from a server component or server action.

## Install

```bash
pnpm add next-przelewy24
# or
npm install next-przelewy24
```

Requires Node.js `>=20.11` and `next` `^15.0.0` as a peer.

## Subpath imports

The package ships three entry points so you can import only what you need:

| Specifier                  | Exports                                                                |
| -------------------------- | ---------------------------------------------------------------------- |
| `next-przelewy24`          | `createP24Server`, `createCheckoutAction`, `createWebhookHandler`, plus re-exported types from `przelewy24-ts-sdk` |
| `next-przelewy24/webhook`  | `createWebhookHandler`                                                 |
| `next-przelewy24/actions`  | `createCheckoutAction`                                                 |

`createP24Server` is just `createClient` from the core SDK, re-exported behind a `server-only` boundary.

## Quick start

### 1. Webhook Route Handler

`app/api/p24/webhook/route.ts`:

```ts
import { createWebhookHandler } from 'next-przelewy24/webhook';

export const runtime = 'nodejs';

export const POST = createWebhookHandler({
  merchantId: Number(process.env.P24_MERCHANT_ID),
  crcKey: process.env.P24_CRC_KEY!,
  onNotification: async (payload) => {
    // payload is already signature-verified
    await saveOrderStatus(payload);
  },
});
```

The handler returns `200 { received: true }` on success, `400` on malformed JSON or an invalid signature, and `500` on unexpected errors thrown from `onNotification`.

### 2. Checkout Server Action

`app/checkout/actions.ts`:

```ts
'use server';
import { createCheckoutAction, createP24Server } from 'next-przelewy24';

export const checkoutAction = createCheckoutAction({
  client: () =>
    createP24Server({
      merchantId: Number(process.env.P24_MERCHANT_ID),
      apiKey: process.env.P24_API_KEY!,
      crcKey: process.env.P24_CRC_KEY!,
    }),
});
```

Passing a factory (`() => createP24Server(...)`) defers env-var reads until the action runs, which keeps `next build` from blowing up when secrets aren't set at build time. You can also pass a long-lived `P24Client` instance instead.

`app/checkout/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { checkoutAction } from './actions';

export default function CheckoutPage() {
  async function action(formData: FormData) {
    'use server';
    const { redirectUrl } = await checkoutAction({
      sessionId: `order-${Date.now()}`,
      amount: 1099,
      currency: 'PLN',
      description: 'Demo order',
      email: String(formData.get('email') ?? ''),
      urlReturn: 'https://shop.example.com/thanks',
      urlStatus: 'https://shop.example.com/api/p24/webhook',
    });
    redirect(redirectUrl);
  }

  return (
    <form action={action}>
      <input name="email" type="email" required />
      <button type="submit">Pay 10.99 PLN</button>
    </form>
  );
}
```

A complete runnable example lives in [`examples/next-app`](./examples/next-app).

## How `'use server'` and `'server-only'` interact

The two directives solve different problems and you typically want both:

- `'use server'` (in a file or function) marks an export as a Server Action — Next compiles it into an RPC endpoint that the client can invoke. The module body still runs only on the server.
- `'server-only'` (this package) is an _import-time guard_: pulling it into a client component fails the bundle. It protects modules that hold secrets (your CRC/API keys, the `P24Client`) from ever ending up in the browser.

All three exports from `next-przelewy24` import `'server-only'`, so even if you forget `'use server'`, importing them from a client component will break `next build`.

## Environment variables

The example app reads three values:

| Variable             | Description                                |
| -------------------- | ------------------------------------------ |
| `P24_MERCHANT_ID`    | Your P24 merchant ID (numeric).            |
| `P24_API_KEY`        | The "Report key" from the P24 admin panel. |
| `P24_CRC_KEY`        | The "CRC key" from the P24 admin panel.    |

The package itself doesn't read `process.env` — you wire it up at the call site.

## Full P24 API

For everything outside webhooks + checkout (refunds, payment methods, card-charge, verify, …) call the underlying [`przelewy24-ts-sdk`](https://github.com/zagi/przelewy24-ts-sdk) directly:

```ts
import { createP24Server } from 'next-przelewy24';

const p24 = createP24Server({ /* … */ });
await p24.verifyTransaction({ /* … */ });
await p24.refundTransaction({ /* … */ });
```

## Contributing

Issues and PRs welcome at [github.com/zagi/next-przelewy24](https://github.com/zagi/next-przelewy24). Run `pnpm install`, then `pnpm test` / `pnpm build` / `pnpm check`.

## License

MIT © 2026 Michał Zagalski
