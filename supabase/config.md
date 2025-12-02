# Supabase Configuration for WhelHost Hotel Reservation App

## Project Configuration
- Project URL: https://dsnepblzxsrpifumqqem.supabase.co
- Project ID: dsnepblzxsrpifumqqem
- Region: us-east-1

## Database Information
- Host: dsnepblzxsrpifumqqem.supabase.co
- Port: 5432
- Database: postgres
- SSL: Required

## Environment Variables
```bash
# Required for the application
NEXT_PUBLIC_SUPABASE_URL=https://dsnepblzxsrpifumqqem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbmVwYmx6eHNycGlmdW1xcWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTI2MzAsImV4cCI6MjA4MDA4ODYzMH0.IIjpC6BGpSCQAw3PQTJjDKN4wFerWk1MFXuVJ0weEQ8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbmVwYmx6eHNycGlmdW1xcWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDUxMjYzMCwiZXhwIjoyMDgwMDg4NjMwfQ.ECcP3OboUhWN9zh_8x_ku_k9gSXZhWk-JPHZdWBtd6M
```

## Database Schema Version
- Created: 2025-01-02
- Schema Files:
  - 001-create-tables.sql (Core tables)
  - 002-rls-policies.sql (Row Level Security)
  - 003-functions-triggers.sql (Functions and triggers)
  - 004-subscriptions-payments.sql (Payment enhancements)
  - 005-add-webhook-columns.sql (Webhook columns)

## API Endpoints
- REST API: https://dsnepblzxsrpifumqqem.supabase.co/rest/v1/
- GraphQL: https://dsnepblzxsrpifumqqem.supabase.co/graphql/v1

## Authentication Settings
- Providers: Email/Password
- Email confirmation required: Yes
- Auto-confirmation: Yes
- Email templates: Custom

## Realtime Configuration
- Enabled: Yes
- Host: realtime.dsnepblzxsrpifumqqem.supabase.co

## Storage Configuration
- Buckets: None configured
- File size limit: 50MB

## Database Extensions Used
- uuid-ossp: For UUID generation
- pg_stat_statements: For query performance
- pgcrypto: For encryption functions

## Connection Pool Settings
- Max connections: 20
- Connection timeout: 20 seconds
- Idle timeout: 10 minutes

## Security Settings
- RLS (Row Level Security): Enabled on all tables
- RLS Policies: As defined in 002-rls-policies.sql
- IP Restrictions: None
- Network ACL: Default

## Backup Configuration
- Automated daily backups: Enabled
- Backup retention: 30 days

## Monitoring
- Query logging: Enabled
- Performance insights: Enabled
- Connection monitoring: Enabled

## Maintenance Windows
- Automatic updates: Enabled
- Maintenance window: Weekends 2-4 AM UTC