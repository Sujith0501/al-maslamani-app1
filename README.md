# AL MASLAMANI Mobile App

Initial Expo / React Native foundation for AL MASLAMANI FOR SERVICES & MAINTENANCE.

## Current scope
- Email/password sign-in using the existing Supabase Auth project
- Password reset request
- Profile lookup from `public.profiles`
- Role-aware starting dashboard for `super_admin`, `admin`, `employee`, `driver`, and `technician`
- Finance card visibility follows `can_view_finances` (Super Admin can see it)

## Important
This is a starter foundation, **not a finished business app**. Customer, job, attendance, pool-visit, driver-trip, fuel, invoices, photo uploads, offline sync, Sinhala UI and admin settings still need to be implemented and tested.

Never put a Supabase `service_role` key in a mobile app. Use only the project URL and publishable/anon key.

## Configure Supabase
Copy `.env.example` to `.env` and set:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Use the existing Supabase project. Do not create a second database unless necessary.

## Run
Install Node.js and dependencies, then:
```bash
npm install
npx expo start
```
