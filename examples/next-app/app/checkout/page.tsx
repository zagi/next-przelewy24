import { redirect } from 'next/navigation';
import { checkoutAction } from './actions';

export default function CheckoutPage() {
  async function action(formData: FormData) {
    'use server';
    const { redirectUrl } = await checkoutAction({
      sessionId: `next-${Date.now()}`,
      amount: 1099,
      currency: 'PLN',
      description: 'Demo order',
      email: String(formData.get('email') ?? ''),
      urlReturn: 'http://localhost:3000/thanks',
      urlStatus: 'http://localhost:3000/api/p24/webhook',
    });
    redirect(redirectUrl);
  }
  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem', maxWidth: '32rem' }}>
      <h1>Next.js × Przelewy24 demo</h1>
      <form action={action}>
        <label>
          Email <input name="email" type="email" defaultValue="test@example.com" />
        </label>
        <button type="submit">Pay 10.99 PLN</button>
      </form>
    </main>
  );
}
