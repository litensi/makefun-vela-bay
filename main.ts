import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outputDir, { recursive: true });

// Resolve the source trees beside this entry point so it can run from any working directory.
for (const directory of ['game', 'screenshots']) {
  cpSync(new URL(directory, import.meta.url), join(outputDir, directory), { recursive: true });
}

// Build the dossier from the copied files using the kit's submission limits.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
