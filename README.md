# Tennet Manager

Tenant and electricity usage tracker built with Expo Router, React Native, and React Native Paper.

## Features

- Manage tenants, notes, and unit rates.
- Log meter readings 
- Import and export data for backups or device transfers.

## Quick start

1. Install dependencies (uses `pnpm`):
   ```bash
   pnpm install
   ```
2. Launch the development server:
   ```bash
   pnpm start
   ```
3. Choose the desired platform from the Expo CLI menu or connect via Expo Go.

## Folder highlights

- `app/` – Expo Router routes (tabs, modals, and detail screens).
- `src/DataContext.tsx` – Central data store with AsyncStorage persistence.
- `src/components/Screen.tsx` – Shared layout wrapper handling safe areas and headers.
