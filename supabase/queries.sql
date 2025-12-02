-- Supabase SQL Queries for WhelHost Hotel Reservation App
-- This file contains common queries used in the application

-- 1. Get user profile with hotel information
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.is_premium,
  p.premium_expires_at,
  h.id as hotel_id,
  h.name as hotel_name
FROM public.profiles p
LEFT JOIN public.hotels h ON p.id = h.owner_id
WHERE p.id = auth.uid();

-- 2. Get hotel with all related information for dashboard
SELECT 
  h.*,
  COUNT(u.id) as total_units,
  COUNT(CASE WHEN u.status = 'occupied' THEN 1 END) as occupied_units,
  COUNT(b.id) as total_bookings
FROM public.hotels h
LEFT JOIN public.units u ON h.id = u.hotel_id
LEFT JOIN public.bookings b ON h.id = b.hotel_id
WHERE h.owner_id = auth.uid()
GROUP BY h.id;

-- 3. Get all bookings for a hotel with guest and unit details
SELECT 
  b.id,
  b.check_in,
  b.check_out,
  b.status,
  b.total_amount,
  b.source,
  g.first_name,
  g.last_name,
  g.email,
  g.phone,
  u.name as unit_name,
  rt.name as room_type,
  rt.base_price
FROM public.bookings b
JOIN public.guests g ON b.guest_id = g.id
LEFT JOIN public.units u ON b.unit_id = u.id
LEFT JOIN public.room_types rt ON u.room_type_id = rt.id
WHERE b.hotel_id = 'hotel-id-here'
ORDER BY b.check_in DESC;

-- 4. Get available units for a specific date range
SELECT 
  u.id,
  u.name,
  u.status,
  rt.name as room_type,
  rt.base_price,
  rt.max_occupancy
FROM public.units u
JOIN public.room_types rt ON u.room_type_id = rt.id
WHERE u.hotel_id = 'hotel-id-here'
  AND u.status != 'maintenance'
  AND u.id NOT IN (
    SELECT unit_id 
    FROM public.bookings 
    WHERE hotel_id = 'hotel-id-here'
      AND status IN ('confirmed', 'checked_in')
      AND (
        (check_in <= 'end-date-here' AND check_out >= 'start-date-here')
      )
  )
ORDER BY u.name;

-- 5. Get revenue reports by month for a hotel
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(total_amount) as revenue,
  COUNT(*) as bookings,
  AVG(total_amount) as avg_booking_value
FROM public.bookings
WHERE hotel_id = 'hotel-id-here'
  AND status IN ('confirmed', 'checked_in', 'checked_out')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 6. Get upcoming bookings for next 30 days
SELECT 
  b.*,
  g.first_name,
  g.last_name,
  g.phone,
  u.name as unit_name
FROM public.bookings b
JOIN public.guests g ON b.guest_id = g.id
LEFT JOIN public.units u ON b.unit_id = u.id
WHERE b.hotel_id = 'hotel-id-here'
  AND b.status IN ('confirmed')
  AND b.check_in BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY b.check_in ASC;

-- 7. Get guest history with their bookings
SELECT 
  g.*,
  COUNT(b.id) as total_bookings,
  MIN(b.check_in) as first_booking,
  MAX(b.check_in) as last_booking,
  SUM(b.total_amount) as total_spent
FROM public.guests g
LEFT JOIN public.bookings b ON g.id = b.guest_id
WHERE g.hotel_id = 'hotel-id-here'
GROUP BY g.id
ORDER BY g.created_at DESC;

-- 8. Get tasks assigned to current user or hotel
SELECT 
  t.*,
  u.name as unit_name,
  b.check_in,
  b.check_out,
  assigned.full_name as assigned_name,
  created.full_name as created_by_name
FROM public.tasks t
LEFT JOIN public.units u ON t.unit_id = u.id
LEFT JOIN public.bookings b ON t.booking_id = b.id
LEFT JOIN public.profiles assigned ON t.assigned_to = assigned.id
LEFT JOIN public.profiles created ON t.created_by = created.id
WHERE t.hotel_id = 'hotel-id-here'
ORDER BY 
  CASE t.priority 
    WHEN 'urgent' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'medium' THEN 3 
    WHEN 'low' THEN 4 
  END,
  t.created_at DESC;

-- 9. Get invoices with payment status
SELECT 
  i.*,
  g.first_name,
  g.last_name,
  b.check_in,
  b.check_out,
  SUM(p.amount) as paid_amount,
  (i.total_amount - COALESCE(SUM(p.amount), 0)) as balance
FROM public.invoices i
LEFT JOIN public.guests g ON i.guest_id = g.id
LEFT JOIN public.bookings b ON i.booking_id = b.id
LEFT JOIN public.payments p ON i.id = p.invoice_id
WHERE i.hotel_id = 'hotel-id-here'
GROUP BY i.id, g.id, b.id
ORDER BY i.created_at DESC;

-- 10. Update booking status and associated unit
UPDATE public.bookings 
SET status = 'checked_in', updated_at = NOW()
WHERE id = 'booking-id-here' 
  AND hotel_id = 'hotel-id-here';

UPDATE public.units 
SET status = 'occupied'
WHERE id = (SELECT unit_id FROM public.bookings WHERE id = 'booking-id-here');

-- 11. Get channel availability (for API integrations)
SELECT 
  c.*,
  COUNT(b.id) as bookings_count
FROM public.channels c
LEFT JOIN public.bookings b ON c.id = b.source::uuid
WHERE c.hotel_id = 'hotel-id-here'
  AND c.is_active = true
GROUP BY c.id
ORDER BY c.name;

-- 12. Insert new booking with guest
INSERT INTO public.guests (id, hotel_id, first_name, last_name, email, phone)
VALUES (
  gen_random_uuid(),
  'hotel-id-here',
  'First Name',
  'Last Name',
  'email@example.com',
  'phone-number'
)
RETURNING id as guest_id;

INSERT INTO public.bookings (
  id, 
  hotel_id, 
  unit_id, 
  guest_id, 
  check_in, 
  check_out, 
  status,
  adults,
  children,
  total_amount
)
VALUES (
  gen_random_uuid(),
  'hotel-id-here',
  'unit-id-here',
  'guest-id-from-above',
  'check-in-date',
  'check-out-date',
  'confirmed',
  2,
  0,
  299.00
);