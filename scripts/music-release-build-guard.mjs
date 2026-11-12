// This release uses one existing Vercel project. Unknown context continues building.
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const branch = 'release/music-radio-vercel';
const project = 'prj_jaS396m0HCvh9FDzSUmLurBuNmjI';
export function shouldSkip(platform, env) {
  if (platform === 'netlify') return env.BRANCH === branch;
  if (platform === 'vercel') return env.VERCEL_GIT_COMMIT_REF === branch && !!env.VERCEL_PROJECT_ID && env.VERCEL_PROJECT_ID !== project;
  return false;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = shouldSkip(process.argv[2], process.env) ? 0 : 1;
}
