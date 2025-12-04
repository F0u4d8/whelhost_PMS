// app/api/moyasar/payments/[id]/capture/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paymentId = params.id;
    const { amount } = await request.json(); // Optional: capture partial amount
    
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

    // Prepare the capture payload
    const capturePayload: any = {};
    if (amount) {
      // Convert amount to smallest currency unit (fils for SAR)
      capturePayload.amount = Math.round(amount * 100);
    }

    // Create authorization header
    const credentials = `${apiKey}:`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const headers = {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json',
      'User-Agent': 'WhelHost-Hotel-Reservation-App/1.0'
    };

    // Make request to Moyasar API to capture payment
    const response = await fetch(`${apiUrl}payments/${paymentId}/capture`, {
      method: 'POST',
      headers,
      body: JSON.stringify(capturePayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Moyasar API capture error: ${errorData}`);
      console.error(`Status: ${response.status}`);

      // Try to parse error response
      try {
        const errorJson = JSON.parse(errorData);
        return NextResponse.json(
          { 
            error: errorJson.message || 'Payment capture failed',
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
    console.error('Moyasar payment capture API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}