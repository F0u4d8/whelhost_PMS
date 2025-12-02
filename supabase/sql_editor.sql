-- WhelHost Database Schema and SQL Editor

-- Database URL: postgresql://postgres:[YOUR-PASSWORD]@dsnepblzxsrpifumqqem.supabase.co:5432/postgres
-- Project URL: https://dsnepblzxsrpifumqqem.supabase.co
-- Project ID: dsnepblzxsrpifumqqem

-- To connect directly to the database, use:
-- psql -h dsnepblzxsrpifumqqem.supabase.co -p 5432 -U postgres -d postgres

-- Or use the Supabase CLI:
-- supabase db shell

-- For SQL editor, you can use the Supabase dashboard:
-- https://supabase.com/dashboard/project/dsnepblzxsrpifumqqem/sql/new

-- Common SQL Operations for WhelHost Hotel Management System

-- 1. Create a new hotel
INSERT INTO public.hotels (name, description, address, city, country, phone, email, currency)
VALUES ('Luxury Hotel', 'A premium hotel for discerning guests', '123 Main St', 'Riyadh', 'SA', '+966123456789', 'info@hotel.com', 'SAR');

-- 2. Create a room type
INSERT INTO public.room_types (hotel_id, name, description, base_price, max_occupancy)
VALUES ('hotel-id-uuid', 'Deluxe Suite', 'Spacious suite with premium amenities', 299.00, 4);

-- 3. Create a unit/room
INSERT INTO public.units (hotel_id, room_type_id, name, floor)
VALUES ('hotel-id-uuid', 'room-type-id-uuid', '101', 1);

-- 4. Create a guest
INSERT INTO public.guests (hotel_id, first_name, last_name, email, phone)
VALUES ('hotel-id-uuid', 'John', 'Doe', 'john.doe@example.com', '+966123456789');

-- 5. Create a booking
INSERT INTO public.bookings (hotel_id, unit_id, guest_id, check_in, check_out, status, adults, total_amount)
VALUES ('hotel-id-uuid', 'unit-id-uuid', 'guest-id-uuid', '2025-01-15', '2025-01-18', 'confirmed', 2, 897.00);

-- 6. Update user premium status
UPDATE public.profiles 
SET is_premium = true, premium_expires_at = NOW() + INTERVAL '1 year'
WHERE id = 'user-id-uuid';

-- 7. Get current occupancy by hotel
SELECT 
  h.name as hotel_name,
  COUNT(u.id) as total_rooms,
  COUNT(CASE WHEN u.status = 'occupied' THEN 1 END) as occupied_rooms,
  ROUND(COUNT(CASE WHEN u.status = 'occupied' THEN 1 END) * 100.0 / COUNT(u.id), 2) as occupancy_rate
FROM public.hotels h
JOIN public.units u ON h.id = u.hotel_id
WHERE h.owner_id = 'user-id-uuid'
GROUP BY h.id, h.name;

-- 8. Get revenue by month
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(total_amount) as total_revenue,
  COUNT(*) as number_of_bookings
FROM public.bookings
WHERE hotel_id = 'hotel-id-uuid'
  AND status IN ('confirmed', 'checked_in', 'checked_out')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 9. Get pending tasks
SELECT 
  t.title,
  t.description,
  t.priority,
  t.due_date,
  u.name as unit_name,
  b.check_in,
  b.check_out
FROM public.tasks t
LEFT JOIN public.units u ON t.unit_id = u.id
LEFT JOIN public.bookings b ON t.booking_id = b.id
WHERE t.hotel_id = 'hotel-id-uuid'
  AND t.status = 'pending'
ORDER BY t.priority DESC, t.due_date ASC;

-- 10. Get guest with all their bookings
SELECT 
  g.first_name,
  g.last_name,
  g.email,
  COUNT(b.id) as total_bookings,
  SUM(b.total_amount) as total_spent,
  MIN(b.check_in) as first_visit,
  MAX(b.check_in) as last_visit
FROM public.guests g
LEFT JOIN public.bookings b ON g.id = b.guest_id
WHERE g.hotel_id = 'hotel-id-uuid'
GROUP BY g.id
HAVING COUNT(b.id) > 0
ORDER BY total_spent DESC;

-- 11. Create an invoice
INSERT INTO public.invoices (hotel_id, booking_id, guest_id, invoice_number, status, subtotal, tax_amount, total_amount, due_date)
VALUES (
  'hotel-id-uuid', 
  'booking-id-uuid', 
  'guest-id-uuid', 
  (SELECT public.generate_invoice_number('hotel-id-uuid')), 
  'sent', 
  897.00, 
  0.00, 
  897.00, 
  CURRENT_DATE + INTERVAL '30 days'
);

-- 12. Create invoice items
INSERT INTO public.invoice_items (invoice_id, description, quantity, unit_price, total_price)
VALUES 
  ('invoice-id-uuid', '3 nights in Deluxe Suite', 3, 299.00, 897.00);

-- 13. Create a payment
INSERT INTO public.payments (hotel_id, invoice_id, booking_id, amount, method, status)
VALUES ('hotel-id-uuid', 'invoice-id-uuid', 'booking-id-uuid', 897.00, 'card', 'completed');

-- 14. Get all units with availability
SELECT 
  u.name as unit_name,
  rt.name as room_type,
  u.status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.unit_id = u.id 
        AND b.status IN ('confirmed', 'checked_in')
        AND CURRENT_DATE BETWEEN b.check_in AND b.check_out
    ) THEN 'Occupied'
    ELSE 'Available'
  END as current_status
FROM public.units u
JOIN public.room_types rt ON u.room_type_id = rt.id
WHERE u.hotel_id = 'hotel-id-uuid'
ORDER BY u.name;

-- 15. Get upcoming arrivals (next 7 days)
SELECT 
  b.*,
  g.first_name,
  g.last_name,
  g.email,
  u.name as unit_name
FROM public.bookings b
JOIN public.guests g ON b.guest_id = g.id
LEFT JOIN public.units u ON b.unit_id = u.id
WHERE b.hotel_id = 'hotel-id-uuid'
  AND b.status IN ('confirmed')
  AND b.check_in BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY b.check_in ASC;

-- 16. Get recent messages
SELECT 
  m.subject,
  m.content,
  m.created_at,
  s.full_name as sender_name,
  CASE WHEN m.is_read THEN 'Read' ELSE 'Unread' END as status
FROM public.messages m
LEFT JOIN public.profiles s ON m.sender_id = s.id
WHERE m.hotel_id = 'hotel-id-uuid'
ORDER BY m.created_at DESC
LIMIT 10;

-- 17. Update unit status based on booking
-- This is handled by the trigger, but you can manually update if needed
UPDATE public.units 
SET status = 'maintenance'
WHERE id = 'unit-id-uuid' AND hotel_id = 'hotel-id-uuid';

-- 18. Get all channels for a hotel
SELECT 
  id,
  name,
  type,
  is_active,
  commission_rate
FROM public.channels
WHERE hotel_id = 'hotel-id-uuid'
ORDER BY name;

-- 19. Update channel with new settings
UPDATE public.channels 
SET settings = settings || '{"api_key": "new-api-key", "endpoint": "new-endpoint"}'
WHERE id = 'channel-id-uuid' AND hotel_id = 'hotel-id-uuid';

-- 20. Get subscription status
SELECT 
  plan,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end
FROM public.subscriptions
WHERE user_id = 'user-id-uuid' AND status = 'active';