import { createWebhookHandler } from 'next-przelewy24/webhook';

export const runtime = 'nodejs';

export const POST = createWebhookHandler({
  merchantId: Number(process.env.P24_MERCHANT_ID),
  crcKey: process.env.P24_CRC_KEY!,
  onNotification: async (payload) => {
    console.log('verified webhook', payload);
  },
});
