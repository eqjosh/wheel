# Emotional Wisdom Wheel — Claude Code Context

## Related Projects

This app is part of the **Emotion Rules book ecosystem** — five apps for Joshua Freedman's book. The Wheel is currently the only app **not** hosted on Firebase (it uses GitHub Pages). The other four apps share a Firebase project with unified Cloud Functions and admin panel.

**For full ecosystem context, read:**
- **Ecosystem overview:** `/Users/joshuafreedman/Documents/emotion-rules-quiz/emotion-rules-quiz-app/EMOTION-RULES-ECOSYSTEM.md`
- **Constellation context:** `/Users/joshuafreedman/Documents/emotion-constellations/claude-constellations-context-2-24-26.md`
- **Quiz/Forms/Admin context:** `/Users/joshuafreedman/Documents/emotion-rules-quiz/emotion-rules-quiz-app/CLAUDE-context-emotion-rules-quiz-2-25-26.md`

**Note:** The Wheel's subscriber gating is independent — it posts directly to a Pardot form handler without using the Firebase `submitToPardot` Cloud Function proxy. If the Wheel is migrated into Firebase in the future, it should switch to using that proxy for consistency and security.

---

This file gives Claude Code the context needed to work on this project without needing lengthy explanation.

---

## What This Is

An interactive web app called the **Emotional Wisdom Wheel** — a clickable SVG emotion wheel with a rich info panel. Users click on one of 32 emotion segments to see definitions, adaptive purpose, guiding questions, overload risks, balance tips, related feelings, emotional algebra, emojis, quotes, and real-life stories.

Based on Joshua Freedman's book **Emotion Rules** and Six Seconds' emotional intelligence methodology. Built to promote the book and 6seconds.org.

---

## Deployment

| Location | URL | Purpose |
|---|---|---|
| Primary embed | https://www.6seconds.org/emotionrules/wheel/ | Production (Divi iframe) |
| GitHub Pages | https://eqjosh.github.io/wheel/ | Hosting source / dev testing |
| GitHub repo | https://github.com/eqjosh/wheel | Source control |

**Active branch:** `feature/pardot-subscriber-gating`
**How to deploy:** `git push` to the active branch → GitHub Pages auto-deploys in ~1-2 minutes.

The Divi page on 6seconds.org embeds the GitHub Pages URL in an iframe:
```html
<iframe
  src="https://eqjosh.github.io/wheel/"
  width="100%"
  height="900"
  frameborder="0"
  style="border: none; max-width: 1600px;"
  allow="clipboard-write"
></iframe>
```

---

## File Structure

```
wheel/
├── index.html                          # Main HTML shell
├── script.js                           # All app logic
├── styles.css                          # All styling
├── 01-Feeling-Wheel-segmented-3.svg    # The emotion wheel SVG (loaded dynamically)
├── emoji-data.json                     # Emoji sets per emotion
├── locales/
│   ├── en.json                         # English — master content file (emotions, quotes, UI strings)
│   ├── es.json                         # Spanish
│   ├── it.json                         # Italian
│   └── ja.json                         # Japanese
├── emotional-wisdom-wheel-content-en.md  # Plain-text export of all English content (for AI use)
├── PARDOT-INTEGRATION-SPEC.md          # Spec doc for the subscriber gating implementation
└── CLAUDE.md                           # This file
```

**Source-of-truth for content:** `locales/en.json` (and equivalent files for other languages)
**Note:** Several legacy/draft files exist in the root (csv, txt, older html mockups) — these can be ignored.

---

## Architecture

**Pure vanilla JS/HTML/CSS — no frameworks, no build step.**

### Data Flow
1. On load, `script.js` fetches and injects the SVG from `01-Feeling-Wheel-segmented-3.svg`
2. Loads `locales/{lang}.json` which contains all emotion content + UI strings + quotes
3. Loads `emoji-data.json` for emoji sets
4. SVG segment IDs follow the pattern: `joy-1-optimistic`, `trust-2-peaceful`, etc.
5. Clicking a segment calls `selectEmotion(emotionId)` which populates the info panel

### Key Global Variables
- `currentEmotionId` — the currently selected emotion
- `currentLanguage` — active locale code (`en`, `es`, `it`, `ja`)
- `localeData` — the full loaded locale JSON
- `emotionsData` — locale emotions keyed by id (built from `localeData.emotions`)
- `quotationsData` — quotes keyed by emotion id (from `localeData.quotes`)
- `emojiData` — emoji data keyed by emotion id (from `emoji-data.json`)

### Tab System
The info panel has 5 tabs: **Essentials, Algebra, Wisdom, Examples, Emojis**
- Wisdom and Examples are **gated** (subscriber-only)
- Tab state managed via `data-tab` attributes and CSS `.active` class
- Content populated on emotion selection

---

## Multilingual Support

4 languages: English (`en`), Spanish (`es`), Italian (`it`), Japanese (`ja`)

Each locale file (`locales/{lang}.json`) contains:
- `ui` — all UI label strings
- `emotions` — array of 32 emotion objects with all content fields
- `quotes` — object keyed by emotion id, each with array of `{text, speaker, work}`

**Important:** `getCategoryColor()` and `getCategoryClass()` in `script.js` must include category name mappings for **all languages** — if adding a new language, update these functions with that language's category names.

**Priority rule for Algebra tab:** locale `borderInfo` takes priority over `emoji.emotionalAlgebra` — this was a deliberate fix to ensure translated content shows instead of English fallback.

**Quotes** are currently English-only across all locales (deferred decision — user chose to leave them in English).

---

## Subscriber Gating (Pardot)

Users must subscribe to access the **Wisdom** and **Examples** tabs.

### How It Works
- Subscription status stored in `localStorage` key: `eww_subscriber`
- When a gated tab is clicked → `showSubscribeModal()` appears
- Modal posts a form directly to the Pardot form handler URL (not via iframe — CORS issue)
- After submit, Pardot redirects back to the page with `?subscribed=true` in the URL
- On load, `script.js` detects `?subscribed=true`, sets `eww_subscriber=true` in localStorage, shows welcome modal

### Pardot Form Handler
- **Endpoint:** `https://eq.6seconds.org/l/446782/2026-02-04/9f5pmx`
- **Fields:** `Email` (email), `First Name` (firstName), `Country` (country)
- **Success redirect:** Should point to `https://www.6seconds.org/emotionrules/wheel/`
- **Country values:** Must match the `PARDOT_COUNTRIES` array in `script.js` exactly

### Key Functions
- `isSubscriber()` — checks localStorage
- `setSubscriber()` — writes to localStorage
- `isGatedTab(tabName)` — returns true for `wisdom` and `examples`
- `showSubscribeModal()` / `hideSubscribeModal()` — modal display
- `showWelcomeBackModal()` — shown after redirect with `?subscribed=true`
- `updateGatedTabsUI()` — adds/removes lock icons on tab buttons

---

## About Card

A dismissable promotional card on the **Essentials** tab promoting the *Emotion Rules* book.
- Dismiss state saved to `localStorage` key: `eww_about_dismissed`
- Close button hides the card and shows a small "ℹ️ About" reopen button
- Styled to match the Definition block (white background, green left border)
- Needs translation: `aboutLabel` key in each locale file

---

## Known Issues / Decisions

- **Quotes are English-only** across all languages — intentional for now
- **iframe sizing:** The wheel is embedded in an iframe on 6seconds.org. Some proportion differences vs standalone are acceptable. The iframe has `allow="clipboard-write"` for the copy emoji feature, plus a JS fallback using `execCommand('copy')` for additional compatibility
- **Toast notification** positioned at top of viewport (not bottom) — works better in iframe context
- **SVG text** is updated dynamically by `updateSVGText()` when language changes

---

## Content Structure (per emotion in locale JSON)

```json
{
  "id": "joy-1-optimistic",
  "name": "Optimistic",
  "category": "Joy",
  "description": "...",
  "question": "...",
  "overloadRisk": "...",
  "overloadTip": "...",
  "adaptivePurpose": "...",
  "relatedFeelings": ["Positive", "Inspired", "Hopeful"],
  "borderInfo": "...",
  "story": "..."
}
```

**32 emotions** across **8 categories:** Joy (4), Trust (4), Fear (4), Surprise (4), Sadness (4), Disgust (4), Anger (4), Anticipation (4)

---

## Owner / Contact

- **Author:** Joshua Freedman
- **GitHub:** eqjosh
- **Organisation:** Six Seconds (6seconds.org)
- **Book:** [Emotion Rules](https://www.6seconds.org/emotionrules)
