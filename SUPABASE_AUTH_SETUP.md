# Supabase Authentication Setup

## Required Configuration Changes

To enable email signups in your Supabase project, you need to make the following changes in your Supabase dashboard:

1. Go to your Supabase dashboard at https://supabase.com/dashboard
2. Navigate to your project (dsnepblzxsrpifumqqem)
3. Go to Authentication → Settings
4. Enable "Email" under Sign-in methods
5. Ensure that "Email confirmations" is enabled (recommended for security)
6. Save the changes

## Current Error
Currently, attempting to sign up via email results in:
```
{"code":"email_provider_disabled","message":"Email signups are disabled"} 
```

This occurs because the email authentication provider is disabled in the project settings.

## Additional Security Settings
For production applications, consider these additional settings:
- Enable "Secure email change" 
- Set a reasonable rate limit for requests
- Configure custom email templates for better user experience

## Verification
After making these changes, you can test the signup form again to confirm that email registration works properly.