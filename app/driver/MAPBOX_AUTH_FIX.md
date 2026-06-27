# Mapbox Authentication Build Fix

## Problem

EAS builds fail with 401 Unauthorized when downloading Mapbox SDK dependencies:

```
Could not GET 'https://api.mapbox.com/downloads/v2/releases/maven/com/mapbox/maps/android-ndk27/11.20.1/android-ndk27-11.20.1.pom'.
Received status code 401 from server: Unauthorized
```

## Root Cause

In `app.json`, the `@rnmapbox/maps` plugin was configured with:

```json
"RNMapboxMapsDownloadToken": "MAPBOX_DOWNLOADS_TOKEN"
```

This passes the **literal string** `"MAPBOX_DOWNLOADS_TOKEN"` (the env var name, not its value) to the prebuild plugin. During `expo prebuild` on EAS, the plugin writes this literal string into `android/gradle.properties`:

```properties
MAPBOX_DOWNLOADS_TOKEN=MAPBOX_DOWNLOADS_TOKEN
```

Gradle then sends `"MAPBOX_DOWNLOADS_TOKEN"` as the auth password to Mapbox's Maven repository → **401 Unauthorized**.

### Why local edits to `android/` don't help

The `android/` directory is gitignored and **fully regenerated** by `expo prebuild` on every EAS build. Any manual edits to `build.gradle`, `settings.gradle`, or `gradle.properties` are discarded on the build server.

## Fix

Replaced `app.json` with `app.config.js` so the token resolves dynamically:

```js
[
  "@rnmapbox/maps",
  {
    RNMapboxMapsImpl: "mapbox",
    RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN,
  },
],
```

### How it works on EAS

1. `eas.json` sets `MAPBOX_DOWNLOADS_TOKEN` env var with the real secret token
2. `expo prebuild` evaluates `app.config.js` → `process.env.MAPBOX_DOWNLOADS_TOKEN` resolves to the actual token
3. The `@rnmapbox/maps` plugin writes the real token into the generated `android/gradle.properties`
4. Gradle authenticates successfully with Mapbox's Maven repository

## Runtime Error: MapboxConfigurationException

After fixing the build, the app may crash at runtime with:

```
MapboxConfigurationException: Using MapView requires providing a valid access token
```

### Cause

The runtime **public** access token (`pk.eyJ...`) is read from `process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` in `src/config/mapbox-config.ts`. Locally this is loaded from `.env`, but `.env` files are **not included in EAS builds**. The env var must be set in `eas.json`.

### Fix

Add `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` to every build profile in `eas.json`:

```json
"env": {
  "MAPBOX_DOWNLOADS_TOKEN": "@MAPBOX_DOWNLOADS_TOKEN",
  "RNMAPBOX_MAPS_DOWNLOAD_TOKEN": "@MAPBOX_DOWNLOADS_TOKEN",
  "EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN": "pk.eyJ..."
}
```

### Two different tokens

| Token | Prefix | Purpose | Used when |
|-------|--------|---------|-----------|
| Secret token | `sk.eyJ...` | Download SDK from Mapbox Maven repo | Build time (Gradle) |
| Public token | `pk.eyJ...` | Authenticate map rendering & API calls | Runtime (in-app) |

## Key Lessons

- `app.json` is **static** — it cannot reference environment variables. Values are used as-is.
- `app.config.js` (or `.ts`) is **dynamic** — it runs as JavaScript, so `process.env.*` works at prebuild time.
- Never put env var *names* in `app.json` plugin configs expecting them to be resolved — they won't be.
- `.env` files work locally but are **not loaded on EAS build servers** — use `eas.json` env blocks.
- `EXPO_PUBLIC_` prefix is required for env vars to be embedded into the JS bundle by Metro.
