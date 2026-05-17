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
