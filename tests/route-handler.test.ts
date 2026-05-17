import { signFields } from '@zagi_14/przelewy24-ts-sdk';
import { describe, expect, it } from 'vitest';
import { createWebhookHandler } from '../src/route-handler';

const payloadBase = {
  merchantId: 1,
  posId: 1,
  sessionId: 's',
  amount: 100,
  originAmount: 100,
  currency: 'PLN',
  orderId: 1,
  methodId: 154,
  statement: 'x',
};
const sign = signFields({ ...payloadBase, crc: 'crc' });
const validPayload = { ...payloadBase, sign };

describe('createWebhookHandler', () => {
  it('returns 200 + invokes onNotification on valid sign', async () => {
    let received: unknown = null;
    const POST = createWebhookHandler({
      merchantId: 1,
      crcKey: 'crc',
      onNotification: async (p) => {
        received = p;
      },
    });
    const req = new Request('https://app.test/api/p24', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(received).toMatchObject({ orderId: 1 });
  });

  it('returns 400 on invalid sign', async () => {
    const POST = createWebhookHandler({
      merchantId: 1,
      crcKey: 'crc',
      onNotification: async () => {},
    });
    const req = new Request('https://app.test/api/p24', {
      method: 'POST',
      body: JSON.stringify({ ...validPayload, sign: 'bad' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 on malformed JSON body', async () => {
    const POST = createWebhookHandler({
      merchantId: 1,
      crcKey: 'crc',
      onNotification: async () => {},
    });
    const req = new Request('https://app.test/api/p24', { method: 'POST', body: '{not json' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
