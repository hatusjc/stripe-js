import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { billing } = await req.json();
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  // Mock mode — no real Stripe key configured
  if (!stripeKey || stripeKey.startsWith('sk_test_placeholder')) {
    const params = new URLSearchParams({ upgrade: 'success', mock: '1', billing });
    return NextResponse.json({ url: `/planos?${params}` });
  }

  try {
    // Dynamic import to avoid issues when Stripe key is absent
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey);

    const priceId = billing === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID não configurado' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/planos?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/planos`,
      allow_promotion_codes: true,
      locale: 'pt-BR',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Falha ao criar sessão de pagamento' }, { status: 500 });
  }
}
