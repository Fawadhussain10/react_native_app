# SPA Booking — Android app (React Native / Expo)

Native Android app for the SPA booking system. It talks **directly to Odoo**
(the `spa_management` token API) — no Firebase, no middle layer — exactly like
the web app.

## How it connects (same multi-tenant idea as the web app)

A phone has no browser URL, so on the **login screen** you enter:

| Field | Production | Local dev |
|-------|-----------|-----------|
| **Company code / server** | `test`  → `https://test.asrbpo.com` | `10.0.2.2:8069` (emulator) or `192.168.1.9:8069` (device) |
| **Database** | `test` (auto-filled) | `asr_new` |
| Email / Password | your staff login | `admin` / … |

`test` → `https://test.asrbpo.com` db `test`; `abc` → `https://abc.asrbpo.com`.
For local, type the host:port and the db. The app remembers your last login.

> Local note: the phone can't reach `localhost` — use the emulator alias
> `10.0.2.2` or your computer's LAN IP, and make sure Odoo is started with
> `--http-port=8069` and reachable on the network.

## Features (parity with the web app)

- Login (company-code → server resolution, staff-only, portal accounts blocked)
- Home dashboard with KPIs (today / draft / posted / total invoiced, contacts, staff)
- Calendar **day agenda** (prev/next/today, tap a slot to add, tap a booking to edit)
- Booking wizard — pick customer → add multiple services (cart, qty) → time → save
- Booking actions: create **draft invoice**, cancel, delete
- Bookings list (all states + filters + search)
- Contacts / Products / Employees (search + detail)
- Invoices (draft/posted/paid filters, totals, line-item detail)
- Per-day booking colours; live-polled invoice figures

## Run it (development)

```bash
cd /opt/odoo18/spa_management_react_native
npm install          # first time only
npx expo start       # then press 'a' for Android, or scan the QR in Expo Go
```

Install **Expo Go** from the Play Store on your phone, scan the QR — no build needed to try it.

## Build the APK

The Android build toolchain (Android SDK + JDK 17) is **not** on this server, so
you have two options.

### Option A — EAS cloud build (recommended, no toolchain needed)

```bash
cd /opt/odoo18/spa_management_react_native
npm install -g eas-cli          # once
eas login                        # your free Expo account (expo.dev)
eas build -p android --profile preview
```

EAS builds the APK in the cloud and prints a download URL. To also drop it into
this folder:

```bash
eas build:list --platform android --limit 1 --json     # get the latest build id/url
# or during build add:  eas build -p android --profile preview --wait
```

### Option B — Local build (needs Android SDK + JDK 17 installed here)

```bash
# one-time toolchain (JDK 17 + Android command-line tools + platform/build-tools)
# then:
cd /opt/odoo18/spa_management_react_native
npx expo prebuild -p android            # generates the native android/ project
cd android && ./gradlew assembleRelease
# APK ends up at:
#   android/app/build/outputs/apk/release/app-release.apk
```

## Rebuild after you change the code

- **JS/UI changes only** (screens, styles, logic): during `npx expo start`, the
  app hot-reloads instantly — no rebuild. For a fresh APK, just run the build
  command again (A or B). Bump `android.versionCode` in `app.json` for each
  Play-Store upload.
- **Changed native deps / app.json**: for local builds re-run
  `npx expo prebuild -p android --clean` before `./gradlew assembleRelease`.

**One-liner to produce a new APK after code changes:**

```bash
# EAS:
eas build -p android --profile preview --wait
# Local:
npx expo prebuild -p android --clean && cd android && ./gradlew assembleRelease
```

## Project layout

```
src/
  lib/      config.js (server resolution) · api.js (token API, AsyncStorage) · datetime · colors · theme · AppData (context)
  store/    redux auth
  components/ Icon (SVG) · ui (avatar/badges/search) · PickerModal
  screens/  Login · Home · Calendar · Bookings · BookingForm(wizard) · Directory(contacts/products/employees) · Invoices · Detail · More
  navigation/ RootNavigator (auth stack ↔ bottom tabs + modals)
```
