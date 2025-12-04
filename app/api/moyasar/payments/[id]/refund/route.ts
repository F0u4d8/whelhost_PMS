// app/api/moyasar/payments/[id]/refund/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paymentId = params.id;
    const { amount, reason } = await request.json(); // Optional: refund partial amount and reason
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.MOYASAR_SECRET_KEY;
    const apiUrl = process.env.MOYASAR_API_URL || 'https://api.sandbox.moyasar.com/v1/';
    
    if (!apiKey) {
      throw new Error('MOYASAR_SECRET_KEY is not configured');
    }

    // Prepare the refund payload
    const refundPayload: any = {};
    if (amount) {
      // Convert amount to smallest currency unit (fils for SAR)
      refundPayload.amount = Math.round(amount * 100);
    }
    if (reason) {
      refundPayload.reason = reason;
    }

    // Create authorization header
    const credentials = `${apiKey}:`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const headers = {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json',
      'User-Agent': 'WhelHost-Hotel-Reservation-App/1.0'
    };

    // Make request to Moyasar API to refund payment
    const response = await fetch(`${apiUrl}payments/${paymentId}/refund`, {
      method: 'POST',
      headers,
      body: JSON.stringify(refundPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Moyasar API refund error: ${errorData}`);
      console.error(`Status: ${response.status}`);

      // Try to parse error response
      try {
        const errorJson = JSON.parse(errorData);
        return NextResponse.json(
          { 
            error: errorJson.message || 'Payment refund failed',
            type: errorJson.type,
            errors: errorJson.errors
          },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: `Moyasar API error: ${errorData}` },
          { status: response.status }
        );
      }
    }

    const payment = await response.json();

    return NextResponse.json({ 
      success: true,
      payment 
    });
  } catch (error: any) {
    console.error('Moyasar payment refund API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}