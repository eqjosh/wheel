# Emotional Wisdom Wheel — Claude Code Context

## Related Projects

This app is part of the **Emotion Rules book ecosystem** — five apps for Joshua Freedman's book. The Wheel is currently the only app **not** hosted on Firebase (it uses GitHub Pages). The other four apps share a Firebase project with unified Cloud Functions and admin panel.

**For full ecosystem context, read:**
- **Ecosystem overview:** `/Users/joshuafreedman/Documents/emotion-rules-quiz/EMOTION-RULES-ECOSYSTEM.md`
- **Constellation context:** `/Users/joshuafreedman/Documents/emotion-constellations/CLAUDE.md`
- **Quiz/Forms/Admin context:** `/Users/joshuafreedman/Documents/emotion-rules-quiz/CLAUDE.md`

**Note:** The Wheel's subscriber gating posts directly to a Pardot form handler (not via the Firebase `submitToPardot` proxy). However, after the Pardot redirect, the Wheel now also fires a tracking request to the `trackSubscription` Cloud Function to record subscriptions in Firestore (`wheelSubscriptions` collection). This data feeds the unified admin Analytics dashboard. If the Wheel is migrated to Firebase hosting in the future, it should switch to using the `submitToPardot` proxy for consistency and security, and cross-app subscriber state sharing becomes possible via localStorage.

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

**Active branch:** `main`
**How to deploy:** `git push` to main → GitHub Pages auto-deploys in ~1-2 minutes.

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
│   ├── ja.json                         # Japanese
│   ├── zh.json                         # Simplified Chinese
│   ├── ko.json                         # Korean
│   └── vi.json                         # Vietnamese
├── translation-review-zh.csv           # Chinese translation review CSV for human translators
├── translation-review-ko.csv           # Korean translation review CSV for human translators
├── translation-review-vi.csv           # Vietnamese translation review CSV for human translators
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
- `currentLanguage` — active locale code (`en`, `es`, `it`, `ja`, `zh`, `ko`)
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

7 languages: English (`en`), Spanish (`es`), Italian (`it`), Japanese (`ja`), Simplified Chinese (`zh`), Korean (`ko`), Vietnamese (`vi`)

Each locale file (`locales/{lang}.json`) contains:
- `ui` — all UI label strings (~51 keys)
- `emotions` — array of 32 emotion objects with all content fields
- `quotes` — object keyed by emotion id, each with array of `{text, speaker, work}`

**Important:** `getCategoryColor()` and `getCategoryClass()` in `script.js` must include category name mappings for **all languages** — if adding a new language, update these functions with that language's category names.

**Priority rule for Algebra tab:** locale `borderInfo` takes priority over `emoji.emotionalAlgebra` — this was a deliberate fix to ensure translated content shows instead of English fallback.

**Quotes** are currently English-only across all locales (deferred decision — user chose to leave them in English).

**SVG text labels** are dynamically updated by `updateSVGText()` when language changes — the SVG itself is a template and does not need per-language versions. However, long translated names may render awkwardly in the SVG segments (especially for CJK languages). Two approaches: (a) the current dynamic text replacement works but may look "funky"; (b) creating a separate Illustrator file per language produces better visual results but adds a maintenance step.

---

## Translation Guide: Adding a New Language

### Checklist (all required steps)

1. **Create locale file:** `locales/{code}.json` — copy `en.json` structure, translate all fields
2. **Update `getCategoryColor()`** in `script.js` (~line 320) — add the 8 translated category names → hex color mappings
3. **Update `getCategoryClass()`** in `script.js` (~line 378) — add the 8 translated category names → CSS class mappings
4. **Update `index.html`** — add `<option value="{code}">Language Name</option>` to the language selector dropdown (~line 28)
5. **Update this CLAUDE.md** — add the language to the Multilingual Support section and file structure
6. **If adding a language-specific SVG:** add it to `SVG_FILES` in `script.js` (e.g. `{ zh: '01-Feeling-Wheel-segmented-3-zh.svg' }`) — and see the SVG viewBox note below

### Where all translatable strings live

| Location | What | Notes |
|---|---|---|
| `locales/{lang}.json` → `ui` | ~51 UI strings (labels, buttons, modals, messages) | **Source of truth** — dynamically applied by `updateUIText()` |
| `locales/{lang}.json` → `ui.howToUseSteps` | Array of 3 strings for welcome message bullet points | Wired to DOM `<li>` elements by `updateUIText()` |
| `locales/{lang}.json` → `ui.aboutCardText1` | About card first paragraph (HTML with link) | Wired to DOM by `updateUIText()` |
| `locales/{lang}.json` → `ui.aboutCardText2` | About card second paragraph (plain text) | Wired to DOM by `updateUIText()` |
| `locales/{lang}.json` → `ui.aboutLabel` | "About" reopen button text | Wired to DOM by `updateUIText()` |
| `locales/{lang}.json` → `emotions[]` | 32 emotions × ~10 fields each (name, category, description, question, overloadRisk, overloadTip, adaptivePurpose, relatedFeelings[], borderInfo, story) | **Source of truth** for all emotion content |
| `locales/{lang}.json` → `emotions[].borderInfo` | Emotional algebra text for ALL 32 emotions | **Critical:** must exist for all 32, not just border emotions — see Lessons Learned below |
| `locales/{lang}.json` → `quotes` | Quotes per emotion (currently English-only across all locales) | Translate if desired; left in English by design decision |
| `script.js` → `getCategoryColor()` | 8 category names per language → hex colors | **Must add** for each new language |
| `script.js` → `getCategoryClass()` | 8 category names per language → CSS class names | **Must add** for each new language |
| `index.html` → language selector | `<option>` element for the language | **Must add** for each new language |
| `emoji-data.json` → `emotionalAlgebra` | English algebra descriptions | Not translated — locale `borderInfo` takes priority in display |
| `script.js` → `PARDOT_COUNTRIES` | Country names for subscribe modal | English-only; these must match Pardot field values exactly |

### Category names per language

| English | Spanish | Italian | Japanese | Chinese (Simplified) | Korean | Vietnamese |
|---|---|---|---|---|---|---|
| Joy | Alegría | Gioia | 喜び | 快乐 | 기쁨 | Niềm Vui |
| Trust | Confianza | Fiducia | 信頼 | 信任 | 신뢰 | Tin Tưởng |
| Fear | Miedo | Paura | 恐れ | 恐惧 | 두려움 | Sợ Hãi |
| Surprise | Sorpresa | Sorpresa | 驚き | 惊讶 | 놀라움 | Ngạc Nhiên |
| Sadness | Tristeza | Tristezza | 悲しみ | 悲伤 | 슬픔 | Buồn Bã |
| Disgust | Asco | Disgusto | 嫌悪 | 厌恶 | 혐오 | Ghê Tởm |
| Anger | Ira | Rabbia | 怒り | 愤怒 | 분노 | Tức Giận |
| Anticipation | Anticipación | Attesa | 期待 | 期待 | 기대 | Mong Đợi |

### Known limitations / not yet localized
- Country dropdown in subscribe modal (must stay in English to match Pardot)
- Privacy notice and consent text in subscribe modal (hardcoded English in `script.js`)
- `<title>` tag in `index.html` (not dynamically updated, though `#page-title` is)

### Lessons Learned from Translation Work

**1. `borderInfo` must exist for ALL 32 emotions, not just border emotions.**
The Algebra tab shows `emotion.borderInfo` (from locale JSON) with a fallback to `emoji.emotionalAlgebra` (from `emoji-data.json`, English-only). Originally, only 16 "border" emotions (positions 1 and 4 in each category) had `borderInfo` in locale files. The other 16 "inner" emotions (positions 2 and 3) silently fell through to the English-only fallback, causing English text to appear on the Algebra tab in non-English languages. **Fix:** every locale file must have `borderInfo` for all 32 emotions.

**2. Chinese quotation marks must use Unicode escapes in JSON.**
Chinese curly quotes (`""`) break JSON parsing because they look like unescaped characters. Use `\u201c` and `\u201d` instead of literal `""` in JSON string values for Chinese locale files.

**3. `updateUIText()` is the wiring point for all dynamic UI text.**
All UI strings from locale JSON are applied to the DOM in this single function. When adding new translatable strings, the pattern is: (a) add the key to all locale files under `ui`, (b) add a DOM update in `updateUIText()`. Currently wired: page title, welcome message paragraph, howToUseSteps `<li>` items, aboutCardText1/2 paragraphs, aboutLabel reopen button, all tab labels, all section labels, all modal text, random feeling button, copyright, version.

**4. Translation review CSVs (`translation-review-{lang}.csv`) are for human reviewers.**
Format: `key,english,{language},claude_note` — one row per translatable string. These are generated alongside AI translations so a native speaker can audit. Keep them updated when adding new keys.

**5. Quotes are intentionally English-only across all locales.**
The `quotes` section in each locale file contains English text. This was a deliberate decision, not an oversight.

**6. Language-specific SVGs exported from Illustrator must have their `viewBox` cropped to match the deployed English SVG.**
When a translator exports a new SVG from Illustrator, the artboard is typically the full document size, leaving large empty margins around the wheel. The deployed English SVG (`01-Feeling-Wheel-segmented-3.svg`) uses a tightly-cropped `viewBox="0 0 3491.02 3491.02"` where the outer ring fills ~99% of the canvas. A freshly-exported SVG will have a much larger viewBox (e.g. `0 0 6438.37 6360.82`), making the wheel appear ~half the size in the app.

**Fix:** After export, update the SVG's `viewBox` attribute to crop to the wheel. The outer ring in all SVGs is at `cx=3177.16 cy=3168.55 r=1735.11` (in the full-canvas coordinate space). The correct cropped viewBox is:
```
viewBox="1431.65 1423.04 3491.02 3491.02"
```
This centers the crop on the outer ring with minimal margin. Edit line 2 of the exported SVG file directly — no other changes needed.

---

## Subscriber Gating (Pardot)

Users must subscribe to access the **Wisdom** and **Examples** tabs.

### How It Works
- Subscription status stored in `localStorage` key: `eww_subscriber`
- When a gated tab is clicked → `showSubscribeModal()` appears
- Modal posts a form directly to the Pardot form handler URL (not via iframe — CORS issue)
- **Before submit:** form data (`firstName`, `email`, `country`) saved to `sessionStorage['eww_subscribe_data']`
- After submit, Pardot redirects back to the page with `?subscribed=true` in the URL
- On load, `script.js` detects `?subscribed=true` via the `eww_subscribe_pending` sessionStorage flag
- **Firebase tracking:** reads form data back from sessionStorage, fires a fetch to `trackSubscription` Cloud Function → writes to `wheelSubscriptions` Firestore collection
- Sets `eww_subscriber=true` in localStorage, shows welcome modal

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

### Firebase Tracking Integration (added March 2026)

The Wheel records each subscription to the shared Firebase project so it appears in the unified admin Analytics dashboard alongside the other four apps.

**Flow:**
1. User submits subscribe form → `handleSubscribeFormSubmit()` saves form data to `sessionStorage['eww_subscribe_data']`
2. Form navigates to Pardot (full page redirect)
3. Pardot redirects back with `?subscribed=true`
4. `initializeSubscriberSystem()` detects the pending flag, reads form data from sessionStorage
5. Fires `fetch()` to `https://us-central1-emotion-rules-quiz.cloudfunctions.net/trackSubscription` with `{ source: 'wheel', firstName, email, country }`
6. Cloud Function writes to `wheelSubscriptions` Firestore collection
7. Tracking is fire-and-forget — errors are caught and logged but don't block the subscription flow

**Why sessionStorage?** The form data needs to survive the Pardot redirect. `sessionStorage` persists across same-tab navigations but is cleared when the tab closes, which is the right lifetime for this use case.

**CORS:** The `trackSubscription` Cloud Function allows `https://eqjosh.github.io` as an origin. If the Wheel moves to Firebase hosting, this origin must be updated.

---

## About Card

A dismissable promotional card on the **Essentials** tab promoting the *Emotion Rules* book.
- Dismiss state saved to `localStorage` key: `eww_about_dismissed`
- Close button hides the card and shows a small "ℹ️ About" reopen button
- Styled to match the Definition block (white background, green left border)
- Translated via 3 locale keys: `aboutLabel` (reopen button), `aboutCardText1` (first paragraph, HTML with link), `aboutCardText2` (second paragraph, plain text)

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
