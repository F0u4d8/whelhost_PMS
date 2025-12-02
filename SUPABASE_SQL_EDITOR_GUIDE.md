# Supabase SQL Editor Guide for WhelHost Hotel Reservation App

## Connection Information
- **Project URL**: https://dsnepblzxsrpifumqqem.supabase.co
- **Project ID**: dsnepblzxsrpifumqqem
- **Public API Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbmVwYmx6eHNycGlmdW1xcWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTI2MzAsImV4cCI6MjA4MDA4ODYzMH0.IIjpC6BGpSCQAw3PQTJjDKN4wFerWk1MFXuVJ0weEQ8
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbmVwYmx6eHNycGlmdW1xcWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDUxMjYzMCwiZXhwIjoyMDgwMDg4NjMwfQ.ECcP3OboUhWN9zh_8x_ku_k9gSXZhWk-JPHZdWBtd6M

## Database Schema Overview

### 1. Core Tables

#### profiles
- User profiles table extending Supabase auth.users
- Primary key: id (UUID) - references auth.users.id
- Stores user information and premium status

#### hotels
- Hotel/property management table
- Primary key: id (UUID) - auto-generated
- owner_id links to profiles.id

#### room_types
- Room types configuration table
- Links to hotels via hotel_id
- Contains pricing and occupancy information

#### units
- Individual rooms/units table
- Links to hotels and room_types
- Tracks status (available, occupied, maintenance, blocked)

#### guests
- Guest information table
- Links to hotels and optionally to profiles

#### bookings
- Booking management table
- Links to hotels, units, and guests
- Status tracking and payment information

#### invoices
- Invoice generation table
- Links to bookings and guests
- Payment tracking

#### invoice_items
- Line items for invoices
- Links to invoices

#### payments
- Payment processing table
- Supports multiple payment methods

#### messages
- Internal messaging system
- For staff and guest communication

#### tasks
- Task management for hotel staff
- Can be assigned to units/rooms

#### smart_locks
- Smart lock device management
- Links to units

#### access_codes
- Temporary access codes for smart locks
- Links to bookings

#### channels
- Booking channel management (OTA connectors)
- Supports commission tracking

#### subscriptions
- Premium subscription table
- Links to user profiles

## Common SQL Queries

### 1. Get all hotels for a specific user
```sql
SELECT * FROM public.hotels WHERE owner_id = 'user-uuid-here';
```

### 2. Get all bookings for a hotel with guest details
```sql
SELECT 
  b.*,
  g.first_name,
  g.last_name,
  g.email,
  u.name as unit_name,
  rt.name as room_type_name
FROM public.bookings b
JOIN public.guests g ON b.guest_id = g.id
JOIN public.units u ON b.unit_id = u.id
JOIN public.room_types rt ON u.room_type_id = rt.id
WHERE b.hotel_id = 'hotel-uuid-here'
ORDER BY b.check_in DESC;
```

### 3. Get current occupancy status by unit
```sql
SELECT 
  u.name as unit_name,
  rt.name as room_type,
  u.status,
  b.check_in,
  b.check_out
FROM public.units u
LEFT JOIN public.room_types rt ON u.room_type_id = rt.id
LEFT JOIN public.bookings b ON u.id = b.unit_id 
  AND b.status IN ('confirmed', 'checked_in')
  AND CURRENT_DATE BETWEEN b.check_in AND b.check_out
WHERE u.hotel_id = 'hotel-uuid-here'
ORDER BY u.name;
```

### 4. Calculate revenue reports
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(total_amount) as revenue,
  COUNT(*) as bookings
FROM public.bookings
WHERE hotel_id = 'hotel-uuid-here' 
  AND status IN ('confirmed', 'checked_in', 'checked_out')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### 5. Get guest information with booking history
```sql
SELECT 
  g.*,
  COUNT(b.id) as total_bookings,
  MAX(b.check_in) as last_booking
FROM public.guests g
LEFT JOIN public.bookings b ON g.id = b.guest_id
WHERE g.hotel_id = 'hotel-uuid-here'
GROUP BY g.id
ORDER BY last_booking DESC NULLS LAST;
```

## RLS Policies
Row Level Security is enabled on all tables with policies that limit access to:
- Own hotels (owned by user)
- Hotels associated with own bookings/guests
- Own profile data
- Data related to hotels they work at (for staff)

## Custom Functions

### 1. generate_invoice_number(hotel_uuid)
Automatically generates invoice numbers in the format {HOTEL_PREFIX}-XXXXXX

### 2. update_unit_status()
Automatically updates unit status based on booking status changes

## Triggers

### 1. on_auth_user_created
Automatically creates a profile when a user signs up

### 2. update_*_updated_at
Updates the updated_at timestamp for all tables when records are modified

## Indexes for Performance
- Bookings: hotel_id, check_in/check_out dates
- Units: hotel_id
- Tasks: hotel_id
- Messages: hotel_id
- Invoices: hotel_id

## Supabase Authentication Setup
The application uses Supabase Auth with:
- Email/Password authentication
- Automatic profile creation on signup
- Email verification required
- Session management in middleware

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL: https://dsnepblzxsrpifumqqem.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Client-side key for anon access
- SUPABASE_SERVICE_ROLE_KEY: Server-side key for admin access

## Database Connection Configuration
- Client: Uses anon key for client-side operations
- Server: Uses anon key with proper cookie handling for server-side operations
- Middleware: Uses server client for session management