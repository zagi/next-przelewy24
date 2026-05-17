import 'server-only';
import { isP24Error, type WebhookPayload } from 'przelewy24-ts-sdk';
import { verifyWebhook } from 'przelewy24-ts-sdk/webhooks';

/** Options for {@link createWebhookHandler}. */
export interface CreateWebhookHandlerOptions {
  /** The merchantId configured with P24. */
  merchantId: number;
  /** The CRC key from the P24 admin panel. */
  crcKey: string;
  /**
   * Callback invoked with the verified payload. Throw to signal failure
   * (handler will still return 200 unless the throw propagates).
   */
  onNotification: (payload: WebhookPayload, request: Request) => void | Promise<void>;
}

/**
 * Build a Next.js Route Handler for the P24 webhook URL. Mount in
 * `app/api/p24/webhook/route.ts` by exporting it as `POST`.
 *
 * @example
 * ```ts
 * import { createWebhookHandler } from 'next-przelewy24/webhook';
 *
 * export const POST = createWebhookHandler({
 *   merchantId: Number(process.env.P24_MERCHANT_ID),
 *   crcKey: process.env.P24_CRC_KEY!,
 *   onNotification: async (payload) => { await saveOrder(payload); },
 * });
 * ```
 */
export function createWebhookHandler(options: CreateWebhookHandlerOptions) {
  return async function POST(request: Request): Promise<Response> {
    let raw: string;
    try {
      raw = await request.text();
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    try {
      const payload = verifyWebhook({
        merchantId: options.merchantId,
        crcKey: options.crcKey,
        payload: raw,
      });
      await options.onNotification(payload, request);
      return Response.json({ received: true });
    } catch (err) {
      if (isP24Error(err)) {
        return Response.json({ error: err.message }, { status: 400 });
      }
      return Response.json({ error: 'Internal error' }, { status: 500 });
    }
  };
}
