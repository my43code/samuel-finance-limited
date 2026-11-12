# Samuel Finance Limited

Corporate website for Samuel Finance Limited, built with static HTML, CSS and JavaScript.

## Preview locally

From this directory, run:

```sh
python -m http.server 8000 --directory dist
```

Open http://localhost:8000. No package installation or build step is needed.

## Files

- `dist/index.html`: website content
- `dist/styles.css`: responsive styles
- `dist/script.js`: mobile navigation and privacy dialog
- `dist/assets/`: company logo, director portrait and mountain photograph
- `check_site.py`: checks local links, section targets and image descriptions
- `.openai/hosting.json`: existing Sites hosting configuration

## Checks

```sh
python check_site.py
node --check dist/script.js
```

## Content and assets

Company information, logo and director portrait were supplied in the November 2026 corporate profile. Proposed services are labelled accordingly; the website makes no claim of confirmed regulatory approval or live loan availability.

Mountain photography: https://unsplash.com/photos/1464822759023-fed622ff2c3b (asset downloaded through images.unsplash.com).

Fonts: DM Sans and Manrope, served through Google Fonts, with system fallbacks.

Serve `dist/` as the static website root when using another hosting provider.
