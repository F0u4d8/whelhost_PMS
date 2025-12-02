-- Add missing columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_out_by UUID REFERENCES profiles(id);

-- Add missing columns to channels table
ALTER TABLE channels ADD COLUMN IF NOT EXISTS property_id TEXT;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

-- Add missing columns to smart_locks table
ALTER TABLE smart_locks ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'generic';
ALTER TABLE smart_locks ADD COLUMN IF NOT EXISTS credentials JSONB;

-- Add missing columns to access_codes table
ALTER TABLE access_codes ADD COLUMN IF NOT EXISTS issued_to TEXT;
ALTER TABLE access_codes ADD COLUMN IF NOT EXISTS provider_response JSONB;

-- Add missing columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS channel_message_id TEXT;

-- Create webhook_logs table if not exists
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  external_id TEXT,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'received',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create index for webhook idempotency check
CREATE INDEX IF NOT EXISTS idx_webhook_logs_idempotency 
ON webhook_logs(provider, external_id, event_type);

-- Create unique constraint on channels for hotel + type
CREATE UNIQUE INDEX IF NOT EXISTS idx_channels_hotel_type 
ON channels(hotel_id, type);

-- Add RLS for webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage webhook logs" ON webhook_logs
  FOR ALL USING (true);
