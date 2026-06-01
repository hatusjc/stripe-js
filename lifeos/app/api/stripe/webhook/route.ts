import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ received: true });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey);

    const body = await req.text();
    const sig = req.headers.get('stripe-signature') ?? '';
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // In production: look up user by session.metadata.userId
      // and update their plan in the database to 'premium'.
      console.log('Checkout completed:', session.id);
    }

    if (event.type === 'customer.subscription.deleted') {
      // Subscription cancelled — downgrade user
      console.log('Subscription cancelled:', event.data.object.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
