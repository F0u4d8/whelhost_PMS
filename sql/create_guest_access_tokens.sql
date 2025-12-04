  -- Create guest_access_tokens table for secure bill access
  CREATE TABLE IF NOT EXISTS public.guest_access_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE, -- Secure token for guest access
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES public.profiles(id), -- Hotel staff who created the token
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create index for performance
  CREATE INDEX idx_guest_access_tokens_booking_id ON public.guest_access_tokens (booking_id);
  CREATE INDEX idx_guest_access_tokens_token ON public.guest_access_tokens (token);
  CREATE INDEX idx_guest_access_tokens_expires_at ON public.guest_access_tokens (expires_at);

  -- RLS Policy: Disable access for regular users since this is for guest access
  ALTER TABLE public.guest_access_tokens ENABLE ROW LEVEL SECURITY;

  -- Allow public access to verify tokens (for guest bill access)
  CREATE POLICY "Allow public read access for token verification" ON public.guest_access_tokens
    FOR SELECT USING (
      -- This is a public table for guest access verification
      true
    );

  -- Insert trigger to update updated_at column
  CREATE OR REPLACE FUNCTION public.handle_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER guest_access_tokens_updated_at
    BEFORE UPDATE ON public.guest_access_tokens
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();