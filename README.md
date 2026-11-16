# Skybound web app

This folder is the current-source single-page web version of the Android app. It mirrors the current Kotlin app flows rather than the older `Skybound v0.98` export.

## Run it

Serve this folder with any static web server and open the site in a browser. For a quick local preview from the project root:

```powershell
python -m http.server 8080 --directory web
```

Then open `http://localhost:8080`.

The app is a single `index.html` with vanilla HTML, CSS, and JavaScript. User data is stored locally in the browser under `skybound.web.current.v1`, with backup and restore available from More.

The current web bundle includes a six-step first-run onboarding/TeenTech tour with screen previews, activities, Current Aim, goals and goal steps, feedback and reviews, weekly rhythm, habits, sessions, calendar, history, altitude ranks, records, milestones, templates, progress reports, appearance, notification settings, widget preview, and the modular mascot with the current pose and customization assets. The bottom bar keeps Home, Goals, Calendar, History and a centered quick-add button; More is available from the top settings button.

There is intentionally no `manifest.json` and no service worker yet, so this is not being packaged as a PWA.

## Android-only features

The Android implementation remains in `app/src/main/java/com/example/skybound/widget` and `app/src/main/java/com/example/skybound/notification`, with its layouts and widget metadata under `app/src/main/res`. Those files were not removed or rewritten, so the native widget and notification work can be reconnected later.

The web app keeps the widget screen and reminder concepts as clearly labelled in-app previews; background notifications and real home-screen widgets remain native Android features.
