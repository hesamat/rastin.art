# Rastin.art

Static site for Alireza Rastinfar.

## Internationalization (i18n)

Translations were refactored (Sept 2025) to external JSON files under `i18n/`.

Structure:
```
i18n/
  fa.json
  en.json
```
Each file mirrors the same key hierarchy. Elements in HTML use `data-i18n="path.to.key"`.

JavaScript (`lang.js`) dynamically loads the JSON for the selected language, caches it, and updates all elements with a `data-i18n` attribute. Fallback: if a key is missing in the active language, the Persian (`fa`) default is attempted.

### Adding a new key
1. Add the key/value to `fa.json` (default language).
2. Add the matching key/value to `en.json` (or other languages later).
3. Reference it in HTML via `data-i18n`.
4. No JS changes required unless you introduce a new language code.

### Adding a new language
1. Create `i18n/<lang>.json` with the full key set.
2. Add a button or selector that calls `updateLanguage('<lang>')` (function already exported globally by being in `lang.js`).

### Notes
- Caching is in-memory per page load. Force refresh by reloading or changing language.
- JSON files are fetched with `cache: 'no-store'` to avoid stale CDNs during development; you can change this to `default` if desired for production.
- HTML elements that have `data-i18n` intentionally contain no fallback inner text to avoid divergence. A `<noscript>` message is provided for users without JavaScript.
