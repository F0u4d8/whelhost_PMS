// app/api/moyasar/payments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency = 'SAR',
      source,
      description,
      metadata = {},
      callback_url,
      return_url,
      supported_networks,
      installments
    } = await request.json();

    // Validate required fields
    if (!amount || !source || !source.type) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['amount', 'source', 'source.type']
        },
        { status: 400 }
      );
    }

    // Get Moyasar credentials from environment
    const moyasarSecretKey = process.env.MOYASAR_SECRET_KEY;
    const apiUrl = process.env.MOYASAR_API_URL || 'https://api.sandbox.moyasar.com/v1/';
    
    if (!moyasarSecretKey) {
      throw new Error('MOYASAR_SECRET_KEY is not configured');
    }

    // Prepare the payment payload according to Moyasar API specification
    const paymentPayload: any = {
      amount: Math.round(amount * 100), // Convert to smallest currency unit (fils for SAR)
      currency,
      source,
      description: description || `Payment for hotel reservation`,
      metadata: {
        ...metadata,
        created_via: 'hotel_reservation_app',
        environment: process.env.NODE_ENV || 'development'
      }
    };

    // Conditionally add optional fields
    if (callback_url) paymentPayload.callback_url = callback_url;
    if (return_url) paymentPayload.return_url = return_url;
    if (supported_networks) paymentPayload.supported_networks = supported_networks;
    if (installments) paymentPayload.installments = installments;

    // Create authorization header
    const credentials = `${moyasarSecretKey}:`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const headers = {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json',
      'User-Agent': 'WhelHost-Hotel-Reservation-App/1.0'
    };

    // Make request to Moyasar API
    const response = await fetch(`${apiUrl}payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Moyasar API error: ${errorData}`);
      console.error(`Status: ${response.status}`);

      // Try to parse error response
      try {
        const errorJson = JSON.parse(errorData);
        return NextResponse.json(
          { 
            error: errorJson.message || 'Payment creation failed',
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

    // Store payment reference in database if booking_id is provided in metadata
    if (metadata.booking_id) {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('payments')
        .insert({
          booking_id: metadata.booking_id,
          amount: amount,
          currency: currency,
          method: 'moyasar',
          status: payment.status,
          moyasar_payment_id: payment.id,
          reference: payment.id,
          gateway_id: payment.gateway_id,
          notes: description || `Payment via Moyasar for booking ${metadata.booking_id}`,
          created_at: payment.created_at
        });

      if (error) {
        console.error('Error storing payment in database:', error);
      }
    }

    return NextResponse.json({ 
      success: true,
      payment 
    });
  } catch (error: any) {
    console.error('Moyasar payment API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('id');
    const apiKey = process.env.MOYASAR_SECRET_KEY;
    const apiUrl = process.env.MOYASAR_API_URL || 'https://api.sandbox.moyasar.com/v1/';
    
    if (!apiKey) {
      throw new Error('MOYASAR_SECRET_KEY is not configured');
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Create authorization header
    const credentials = `${apiKey}:`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const headers = {
      'Authorization': `Basic ${encodedCredentials}`,
      'User-Agent': 'WhelHost-Hotel-Reservation-App/1.0'
    };

    // Get payment from Moyasar API
    const response = await fetch(`${apiUrl}payments/${paymentId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Moyasar API error: ${errorData}`);
      
      return NextResponse.json(
        { error: `Failed to retrieve payment: ${errorData}` },
        { status: response.status }
      );
    }

    const payment = await response.json();

    return NextResponse.json({ 
      success: true, 
      payment 
    });
  } catch (error: any) {
    console.error('Moyasar get payment API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// For listing payments
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const apiKey = process.env.MOYASAR_SECRET_KEY;
    const apiUrl = process.env.MOYASAR_API_URL || 'https://api.sandbox.moyasar.com/v1/';
    
    if (!apiKey) {
      throw new Error('MOYASAR_SECRET_KEY is not configured');
    }

    // Get query parameters for filtering
    const filters: any = {};
    for (const [key, value] of searchParams.entries()) {
      if (['from', 'to', 'status', 'source_type', 'page', 'per_page'].includes(key)) {
        filters[key] = value;
      }
    }

    // Build query string
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    // Create authorization header
    const credentials = `${apiKey}:`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const headers = {
      'Authorization': `Basic ${encodedCredentials}`,
      'User-Agent': 'WhelHost-Hotel-Reservation-App/1.0'
    };

    // List payments from Moyasar API
    const response = await fetch(`${apiUrl}payments${params.toString() ? '?' + params.toString() : ''}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Moyasar API error: ${errorData}`);
      
      return NextResponse.json(
        { error: `Failed to list payments: ${errorData}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({ 
      success: true, 
      payments: result.items,
      has_more: result.has_more,
      total: result.total
    });
  } catch (error: any) {
    console.error('Moyasar list payments API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}