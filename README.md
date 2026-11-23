# Vela Bay

[![Make.fun bounty](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/litensi/makefun-vela-bay/rank.svg)](https://make.fun/bounty/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/litensi/makefun-vela-bay/reward.svg)](https://make.fun/bounty/gta6-01)

Vela Bay is an original low-poly 3D crime game set in a sunlit port city. Follow a payment ledger from Market Row to a waterfront shootout, race Kira Sol around South Quay, or take a getaway car over a stunt ramp.

## Play

Serve the repository with `python3 -m http.server 8000` and open `http://localhost:8000/game/`. The browser game uses a local Three.js build and falls back to Canvas 2D when WebGL2 is unavailable. The local server works offline.

| Control | Action |
| --- | --- |
| WASD or arrow keys | Walk, or accelerate, reverse and steer in a car |
| Shift | Sprint on foot |
| Mouse and left click | Aim and fire the pistol on foot |
| E | Interact with contacts, objectives, cars, the garage, and the race start |
| Space | Drift in a car |
| Escape | Pause or resume |

Mint markers lead through three contracts in order. Deliver Mara Voss’s parcel for $350, recover Inez Vale’s pier debt for $650, and secure the shipping manifest for Rafi Cruz for $1,200. Amber markers show active objectives.

At three stars, a police helicopter searches the last known area. Get out of sight until heat clears, or stop in the cyan Pay & Spray bay and press E to pay $150 for a respray and clear your warrant.

Stop at the pink Quay Circuit marker in a car and press E to start the race. Beat Kira through the checkpoints for $400. Hit the striped stunt ramps at speed in the arrow direction to launch.

Continue restores your position, vitals, balance, vehicle, wanted level, and contract progress in the same browser.

## Capture and package

Use `?shot=title&seed=1`, or replace `title` with `street`, `chase` or `mission`, for a frozen capture. Committed images are in [screenshots](screenshots/). For headless Chromium captures, pass `--enable-unsafe-swiftshader --use-angle=swiftshader`.

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```
