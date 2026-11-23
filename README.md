# Vela Bay

[![Make.fun bounty](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/litensi/makefun-vela-bay/rank.svg)](https://make.fun/bounty/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/litensi/makefun-vela-bay/reward.svg)](https://make.fun/bounty/gta6-01)

Vela Bay is an original top-down crime game set in a sunlit port city. Run a parcel through Market Row or collect a debt at South Quay and shake the police before getting paid.

## Play

Serve the repository with `python3 -m http.server 8000` and open `http://localhost:8000/game/`. The browser game uses Canvas 2D and native ES modules. The local server works offline.

| Control | Action |
| --- | --- |
| WASD or arrow keys | Walk, or accelerate, reverse and steer in a car |
| Shift | Sprint on foot |
| Mouse and left click | Aim and fire the pistol on foot |
| E | Speak to a contact, complete an objective, or enter or exit a car |
| Space | Drift in a car |
| Escape | Pause or resume |

Mint markers are contacts. Amber markers are active objectives. Break police line of sight and stay out of sight until the stars clear. Continue restores your position, vitals, balance, wanted level and contract progress from this browser.

## Capture and package

Use `?shot=title&seed=1`, or replace `title` with `street`, `chase` or `mission`, for a frozen capture. Committed images are in [screenshots](screenshots/).

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```
