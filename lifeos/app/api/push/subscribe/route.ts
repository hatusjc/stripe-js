import { NextRequest, NextResponse } from 'next/server';

// In production: save subscription to database tied to userId.
// For this demo, we just acknowledge receipt.
export async function POST(req: NextRequest) {
  try {
    const { subscription } = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    // TODO (production): save to Supabase subscriptions table
    console.log('Push subscription registered:', subscription.endpoint.slice(0, 40) + '...');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    // TODO (production): remove from database
    console.log('Push subscription removed:', endpoint?.slice(0, 40));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
