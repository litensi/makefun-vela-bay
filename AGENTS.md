# Entry: Vela Bay — an open-world crime game (GTA-like, original)

One browser tab, canvas 2D, static files under `game/`, keyboard + mouse, offline, no libraries. Original city, names and art. Completeness first, then depth, feel, look, structure.

## World
Coastal city "Vela Bay": tile map 100x100, asphalt road grid every 12 tiles with lane markings and crossings, sidewalks, blocks of low-rise buildings with lit windows and signage, palms, a waterfront promenade, a park, a stadium. Day-gold light, long shadows, warm haze. Pedestrians wander sidewalks and flee gunfire; traffic follows lanes and stops for lights.

## Play
Top-down third-person. On foot: WASD move, mouse aim, left-click shoot (pistol), F enter/exit car, Space sprint. In car: W/S throttle/brake, A/D steer, physics drift, E/F exit, mouse-free. Cars can be carjacked (hold E at the door, the driver bails). Wanted 0-5 stars: stars raise with crimes (carjack, shots, hitting peds), police sedans spawn and chase, shoot from cover, lose them by breaking line of sight 20s. Health bar, cash, mission markers, minimap with roads, blips and a north arrow. Missions: yellow markers give a courier run / a shakedown, with objective text, waypoints and a payout. Save: localStorage autosave of cash/missions; Continue on the title. Pause menu with controls.

## Screens and shots
`?shot=title|street|chase|mission&seed=1` render a deterministic posed frame with no input:
- title: city skyline band, logo "VELA BAY", subtitle "a crime story in the sun", Start/Continue.
- street: on foot on a busy sidewalk, peds and parked cars, HUD, minimap.
- chase: driving, 3 wanted stars, two police cars behind with lights, minimap with a pursuit blip, damaged bumper.
- mission: shootout at a courier handoff, objective banner "Deliver the case to the Marina", bullets, cash HUD.
Screenshots: `screenshots/1-title.jpg`, `2-street.jpg`, `3-chase.jpg`, `4-mission.jpg`, 1280x720 whole JPEG, under 256 KiB, real captures of `game/index.html?shot=...`.

## Hard rules
- `game/index.html` + ES modules under `game/src/`, standard JS, no imports outside game/, no network, no libraries (vendor untouched).
- `main.ts` (already) + dossier via vendor lib with caps text 163840, screenshots max 4 / 262144 bytes, game 993 files / 50331648 bytes, path 1000 bytes.
- Split source by job, descriptive names; LICENSE + owner already. README carries three make.fun badges.
- Capture: `~/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1280,720 --virtual-time-budget=5000 --screenshot=<out.png> "file://<abs>/game/index.html?shot=<x>&seed=1"`, then convert to JPEG with Pillow (quality 88); verify each with `file` and `stat -c%s` (<=262144) and dimensions 1280x720. Retake empty/failed frames; the ?shot scenes must draw a finished frame immediately.

## Work
1. Build world, then systems, then HUD/menus/save.
2. Play a scripted headless smoke test (node script driving the sim) to shake out crashes.
3. Capture and inspect all four shots, fix art/legibility.
4. Revise twice, regenerate shots, `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`, commit and push.
