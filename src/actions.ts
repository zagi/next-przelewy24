import 'server-only';
import type {
  P24Client,
  RegisterTransactionInput,
  RegisterTransactionResult,
} from 'przelewy24-ts-sdk';

export interface CreateCheckoutActionOptions {
  /** A P24Client instance, or a factory that produces one lazily on first invocation. */
  client: P24Client | (() => P24Client);
}

/**
 * Build a Server Action that registers a P24 transaction and returns the
 * redirect URL. Wrap with `'use server'` at the call site.
 *
 * @example
 * ```ts
 * 'use server';
 * import { createP24Server, createCheckoutAction } from 'next-przelewy24';
 *
 * const p24 = createP24Server({
 *   merchantId: Number(process.env.P24_MERCHANT_ID),
 *   apiKey: process.env.P24_API_KEY!,
 *   crcKey: process.env.P24_CRC_KEY!,
 * });
 *
 * export const checkoutAction = createCheckoutAction({ client: p24 });
 * ```
 */
export function createCheckoutAction(options: CreateCheckoutActionOptions) {
  return async function checkout(
    input: RegisterTransactionInput,
  ): Promise<RegisterTransactionResult> {
    const client = typeof options.client === 'function' ? options.client() : options.client;
    return client.registerTransaction(input);
  };
}
