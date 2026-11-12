# Design System — kimrebecca.com

The one rulebook for the whole site. Every page (home, about, every case study)
uses the same tokens and components, so a change made in one place shows up everywhere.

## The three rules

1. **Style lives in CSS, never in the page.** No `style="…"` attributes in HTML. If a page
   needs a new look, add or change a class in the stylesheet so every page that uses it updates.
2. **Use tokens, not raw values.** Colors, font sizes, spacing, radii and easing come from the
   variables in `styles.css` (`:root`). Change a token once and the whole site follows.
3. **Project content has one home: `projects.js`.** Titles, descriptions, tags and thumbnails
   are written there once and rendered into the home grid, each case study's header and hero,
   and the "Other case studies" cards.

## Where things live

| File | What it controls | Used by |
|---|---|---|
| `styles.css` | Tokens, nav, buttons, tags, cards, home and about layout | Every page |
| `case-study.css` | Case study layout and blocks (`cs-*` classes) | All case studies |
| `case-study.js` | Builds the left progress rail and fills it as you scroll | All case studies |
| `projects.js` | Project data + rendering of cards, headers and heroes | Home and all case studies |
| `DESIGN.md` | This document | You |

**Changing a case study's format** (padding, text size, fonts, buttons, block styles):
edit `case-study.css` or `styles.css`. All three case studies share those files, so they
always change together. Only edit a case study's `.html` to change its *words and images*.

## Tokens (`styles.css` → `:root`)

### Color

| Token | Value | Use |
|---|---|---|
| `--primary` | `rgb(44,44,44)` | Body text, headings, active nav tab |
| `--secondary` | `rgb(115,115,115)` | Descriptions, subtitles, Back button text |
| `--disabled` | `rgb(170,170,170)` | Inactive nav tabs, labels, eyebrows |
| `--surface` | `#f5f5f5` | Image placeholders, media backgrounds |
| `--card` | `rgba(179,179,179,.08)` | Button pills, tags, soft card fills |
| `--divider` | `rgb(235,235,235)` | Borders, rules, progress track |
| `--white` | `#fff` | Page background |
| `--teal` | `#71bbc7` | Progress fill, accents |
| `--teal-dark` | `rgb(47,125,138)` | Accent tag text, stat numbers, focus ring |
| `--teal-tint` | `rgba(113,187,199,.16)` | Accent tag and callout background |
| `--pink` | `rgb(255,171,208)` | Brand accent (logo dot) |

### Type

Font: **Hanken Grotesk** (400 regular, 600 semibold), loaded from Google Fonts on every page.
Sizes step down at the tablet (≤1199px) and phone (≤809px) breakpoints automatically.

| Token | Desktop | Tablet | Phone | Use |
|---|---|---|---|---|
| `--fs-display` | 80 | 56 | 40 | Reserved for display text |
| `--fs-title` | 27 | 24 | 22 | Case study section headings (`cs-h2`) |
| `--fs-sub` | 22 | 20 | 18 | Eyebrows, `cs-h3` |
| `--fs-card-title` | 24 | 20 | 18 | Project card titles |
| `--fs-body-lg` | 20 | 18 | 16 | Lede, case study prose |
| `--fs-body` | 18 | 16 | 14 | Default body text |
| `--fs-small` | 16 | 14 | 12 | Tags, buttons, captions, progress rail |
| `--fs-label` | 14 | 12 | 12 | Uppercase labels (`cs-label`) |

Case study titles use `clamp(28px, 4vw, 44px)`. Weights: 400 for text, 600 for headings and titles.

### Spacing (4px scale)

`--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-6` 24 · `--s-8` 32 · `--s-10` 40 ·
`--s-16` 64 · `--s-32` 128 (112 tablet, 96 phone)

### Shape and motion

Radii: `--radius-sm` 4 · `--radius-md` 8 · `--radius-lg` 16 · pills use `999px`.
Easing: `--ease` = `cubic-bezier(0, 0, 0.2, 1)`, 0.2s for color and background, 0.3s for image zoom.

### Layout

- `--content-w: min(88%, 1600px)` (90% on phones). The nav, home sections and case study layout
  all use it, so their edges line up on every screen size.
- Breakpoints: **desktop ≥1200px**, **tablet 810–1199px**, **phone ≤809px**.
  The home signature switches to the phone crop below 700px (matches the live site).
  The case study progress rail appears from 1100px.

## Components

### Nav (every page)
Logo on the left, `projects` and `about` on the right. 12px vertical padding, full-width
translucent bar. The current page's tab gets a soft gray pill (`aria-current="page"`).

### Buttons (`styles.css`)
- `.button` — pill, `--card` background, `--fs-small`, 37px tall.
- `.button--back` — same pill with `--secondary` text. Used as **"← Back"** at the top of every
  case study, linking to `index.html#work`.

### Tags
`.tag` (gray pill) and `.tag--teal` (accent). The first tag on each project is the accent one
(`accent: true` in `projects.js`).

### Project card
`.card` → `.card__media` (1.61:1 thumbnail, 16px radius, zooms slightly on hover) →
`.card__body` (`.card__title`, `.card__desc`, `.tags`). Rendered only by `projects.js`.

`.card--row` is the compact version used for "Other case studies": a 160px thumbnail
(112px on phones) on the left, title and tags stacked on the right, no description,
smaller title (`--fs-body`). Two per row, one per row on phones.

### Case study page
Structure every case study follows:

```
<body data-project="slug">
  nav
  .cs-layout
    aside.cs-progress        Back button + section rail (built by case-study.js)
    main.cs
      header.cs-head [data-project-header]   title, lede, tags  (from projects.js)
      div.cs-hero [data-project-hero]        thumbnail image    (from projects.js)
      .cs-facts                              Timeline / Role / Team / Tools
      section.cs-section[data-nav="Label"]   one per chapter; label shows in the rail
      ...
      section.cs-section--more               light full-width band for "Other case studies"
        .cs-more [data-project-more]         row cards (from projects.js)
```

Spacing:
- **Tight top:** 24px between the title block, hero image and facts row.
- **Roomy content:** 88px above every section (64px margin + 24px gap), 40px on phones,
  and 32px between the blocks inside a section.
- **Other case studies band:** `--card` fill running edge to edge across the screen, square
  corners, 32px top and bottom padding (24px on phones), heading at `--fs-body-lg`.
Rail: 140px wide, 40px gap to the content.

Blocks available inside a section (see `case-study.css`): `cs-prose`, `cs-callouts`,
`cs-figure`, `cs-features`, `cs-stats`, `cs-themes`, `cs-cards` (`--2`, `--4`), `cs-box`,
`cs-pair`, `cs-steps` / `cs-result`, `cs-chips`, `cs-actions`, and `ph` image placeholders.
Modifiers for extra space: `cs-head--spaced`, `cs-h3--spaced`; larger subtitle: `cs-sub--lg`.

## How to…

- **Change a project's title, description, tags or thumbnail:** edit its entry in `projects.js`.
  The home card, the case study header and hero, and the "Other case studies" cards all update.
- **Add a project:** add an entry to `projects.js`, copy an existing case study `.html`, change
  `data-project` on `<body>` to the new slug, and replace the section content.
- **Add a section to a case study:** add `<section class="cs-section" data-nav="Label">`. It
  appears in the progress rail automatically.
- **Restyle all case studies:** change the class in `case-study.css` (or a token in `styles.css`).
- **Need a new look?** Add a class (or modifier) to the right stylesheet and document it here.
