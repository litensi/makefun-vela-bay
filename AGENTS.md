# Vela Bay

- Serve the repository over local HTTP for browser checks. The game entry point is `game/index.html`.
- Keep game assets and runtime source under `game/` and use native browser APIs. The game must run offline without dependencies.
- Keep city geometry in sync with collision and art. Use the seeded random generator for repeatable capture layouts.
- Keep capture poses frozen and independent of saved games. Regenerate and inspect all four 1280 × 720 JPEGs after visual changes. Each must be below 256 KiB.
- Preserve `main.ts` as the packaging entry point. Run `MAKEFUN_OUTPUT_DIR=out node main.ts` and keep the generated output out of Git.
