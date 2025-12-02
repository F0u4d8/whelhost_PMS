// app/api/payments/moyasar/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPayment, getPayment, processWebhook } from '@/lib/moyasar';

export async function POST(request: NextRequest) {
  const { amount, currency, source, description, metadata } = await request.json();

  try {
    // Validate required fields
    if (!amount || !source) {
      return NextResponse.json(
        { error: 'Amount and source are required' },
        { status: 400 }
      );
    }

    // Create payment with Moyasar
    const payment = await createPayment({
      amount,
      currency: currency || 'SAR',
      source,
      description: description || 'Hotel Booking Payment',
      metadata: metadata || {},
    });

    return NextResponse.json({ 
      success: true, 
      payment 
    });
  } catch (error: any) {
    console.error('Moyasar payment error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get('id');

  if (!paymentId) {
    return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
  }

  try {
    const payment = await getPayment(paymentId);
    return NextResponse.json({ payment });
  } catch (error: any) {
    console.error('Moyasar get payment error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// Handle Moyasar webhooks
export async function PUT(request: NextRequest) {
  const signature = request.headers.get('X-Moyasar-Signature');
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  try {
    const result = await processWebhook(payload, signature);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Moyasar webhook error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}