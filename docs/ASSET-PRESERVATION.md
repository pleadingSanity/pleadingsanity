# Pleading Sanity — Asset Preservation

Inventory checked against the GitHub `main` tree on 10 October 2026. At inspection, the repository contained **87 image assets**, totalling **13,288,965 bytes** (~12.7 MiB), including icons, logos, branding, game art, frequency art and sharing images. This inventory is not proof that every asset is correctly displayed or optimised.

## Preserve first
- Official logo: `assets/images/brand/crying-brain-logo.webp` and `assets/images/brand/crying-brain-logo-512.webp`
- Alternate branding: `assets/images/brand/pleading-sanity-logo.webp`, `assets/images/brand/sanctuary-logo.webp`
- Favicons: `assets/favicon.ico`, `assets/favicon.svg`, `assets/apple-touch-icon.png`
- App icons: `assets/icons/icon.svg`, `assets/icons/icon-72x72.png` through `icon-512x512.png`
- Share images: `assets/crying-brain-og.png`, `assets/share/`
- Other original images: `assets/images/`, `assets/memes/`, `assets/theme/`

## Verified source snapshot
At the time of inspection, the recursive Git tree SHA was `911e50f2079845cfad90a1dae14c90a45670958f`. The Git repository preserves file history, but is **not** an independent offsite backup.

## When on PC
1. Download the repository ZIP from GitHub **Code → Download ZIP** or clone it.
2. Copy the complete `assets/` directory to a second location (external drive or personal cloud).
3. Also save the ZIP and note the Git commit SHA. Keep a separate copy of Firebase configuration and rules (without exposing secrets).
4. Verify icons and branding on desktop and mobile; do not change the canonical crying-brain logo.
5. Inspect manifest icon paths, MIME types, declared dimensions and maskable requirements. A WebP path must not claim `image/png`.
6. Compare live site image URLs with repository assets and fix missing or oversized files in focused PRs.

## Local backup commands
```bash
git clone https://github.com/pleadingSanity/pleadingsanity.git
cd pleadingsanity
git rev-parse HEAD
```

To create an asset-only archive on a machine with Python installed:
```bash
python -c "import shutil; shutil.make_archive('pleading-sanity-assets-backup', 'zip', '.', 'assets')"
```

Do not upload private user data, secrets or Firebase service-account credentials to public repositories. Do not treat a public repo as the only backup.
