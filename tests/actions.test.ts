import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createCheckoutAction } from '../src/actions';
import { createP24Server } from '../src/client';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('createCheckoutAction', () => {
  it('registers a transaction via the wrapped client and returns redirectUrl', async () => {
    server.use(
      http.post('https://sandbox.przelewy24.pl/api/v1/transaction/register', () =>
        HttpResponse.json({ data: { token: 'next-tok' } }),
      ),
    );
    const client = createP24Server({ merchantId: 1, apiKey: 'k', crcKey: 'c' });
    const checkout = createCheckoutAction({ client });
    const result = await checkout({
      sessionId: 's-1',
      amount: 1099,
      currency: 'PLN',
      description: 'Order',
      email: 't@t.test',
      urlReturn: 'https://app.test/return',
    });
    expect(result.token).toBe('next-tok');
    expect(result.redirectUrl).toBe('https://sandbox.przelewy24.pl/trnRequest/next-tok');
  });

  it('accepts a client factory (lazy resolution)', async () => {
    server.use(
      http.post('https://sandbox.przelewy24.pl/api/v1/transaction/register', () =>
        HttpResponse.json({ data: { token: 'lazy-tok' } }),
      ),
    );
    const checkout = createCheckoutAction({
      client: () => createP24Server({ merchantId: 1, apiKey: 'k', crcKey: 'c' }),
    });
    const result = await checkout({
      sessionId: 's-2',
      amount: 100,
      currency: 'PLN',
      description: 'd',
      email: 'a@b.test',
      urlReturn: 'https://app.test/r',
    });
    expect(result.token).toBe('lazy-tok');
  });
});
