-- Row Level Security Policies for WhelHost

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Hotels policies
CREATE POLICY "Users can view own hotels" ON public.hotels
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own hotels" ON public.hotels
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own hotels" ON public.hotels
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own hotels" ON public.hotels
  FOR DELETE USING (owner_id = auth.uid());

-- Room Types policies
CREATE POLICY "Users can manage room types of own hotels" ON public.room_types
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  );

-- Units policies
CREATE POLICY "Users can manage units of own hotels" ON public.units
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  );

-- Guests policies
CREATE POLICY "Users can manage guests of own hotels" ON public.guests
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  );

-- Bookings policies
CREATE POLICY "Users can manage bookings of own hotels" ON public.bookings
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  );

-- Invoices policies
CREATE POLICY "Users can manage invoices of own hotels" ON public.invoices
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  );

-- Invoice Items policies
CREATE POLICY "Users can manage invoice items of own invoices" ON public.invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT i.id FROM public.invoices i
      JOIN public.hotels h ON i.hotel_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can manage payments of own hotels" ON public.payments
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  );

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid() OR
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Tasks policies
CREATE POLICY "Users can manage tasks of own hotels" ON public.tasks
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
    OR assigned_to = auth.uid()
  );

-- Smart Locks policies
CREATE POLICY "Users can manage smart locks of own hotels" ON public.smart_locks
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  );

-- Access Codes policies
CREATE POLICY "Users can manage access codes of own hotels" ON public.access_codes
  FOR ALL USING (
    smart_lock_id IN (
      SELECT sl.id FROM public.smart_locks sl
      JOIN public.hotels h ON sl.hotel_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

-- Channels policies
CREATE POLICY "Users can manage channels of own hotels" ON public.channels
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  );

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view notifications for their hotels" ON public.notifications
  FOR SELECT USING (
    hotel_id IN (
      SELECT id FROM public.hotels WHERE owner_id = auth.uid()
    )
    OR
    hotel_id IN (
      SELECT h.id FROM public.hotels h
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE p.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can insert notifications for their hotels" ON public.notifications
  FOR INSERT WITH CHECK (
    hotel_id IN (
      SELECT id FROM public.hotels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notifications for their hotels" ON public.notifications
  FOR UPDATE USING (
    hotel_id IN (
      SELECT id FROM public.hotels WHERE owner_id = auth.uid()
    )
  );