# MediTrack — Public Website UI Specification (Implementation-Ready)

**Source of truth:** reference screenshot (`WhatsApp_Image_2026-09-21_at_6_33_07_PM.jpeg`), refined against `DESIGN.md` tokens and `ARCHITECTURE.md` component boundaries.
**Scope:** visual/UI spec only. No architecture changes, no backend logic. Every component name below maps 1:1 to the existing `src/components/...` structure in `ARCHITECTURE.md`.
**Consumer:** a coding agent implementing this directly in the existing MediTrack codebase.

---

## 0. Design Tokens (single source — do not redeclare)

```css
/* Brand */
--color-brand-navy:   #0E4366; /* header, primary CTA, search button */
--color-brand-dark:   #0B3553; /* footer, emergency widget, dark accents */
--color-brand-blue:   #1877A9; /* Call Hospital, active states, icon fills */
--color-brand-light:  #EAF4F9; /* hero bg, feature icon circles */
--color-brand-subtle: #DCEBF5; /* active preset pill, selected filter bg */

/* Status */
--color-available:    #16A34A;
--color-unavailable:  #DC2626;
--color-unknown:      #64748B;   /* neutral gray, same family as muted text */
--color-stale-bg:     #FEF3C7;   /* amber-100, warning surface */
--color-stale-text:   #92400E;   /* amber-800 */
--color-stale-border: #FDE68A;

/* Neutrals */
--color-page-bg:      #F8FAFC;
--color-surface:      #FFFFFF;
--color-text-primary: #0F172A;
--color-text-secondary:#475569;
--color-text-muted:   #64748B;
--color-border:       #E2E8F0;

/* Radius */
--radius-sm:   8px;    /* inputs, small buttons, badges */
--radius-md:   12px;   /* cards */
--radius-lg:   16px;   /* search console, large containers */
--radius-pill: 9999px; /* Staff Login button, preset chips, "Call Hospital"/"Search" buttons */

/* Shadow (use exactly one of these — never stack) */
--shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.04);
--shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);   /* search console, hospital card */
--shadow-md: 0 4px 16px rgba(15, 23, 42, 0.08);  /* search console on hover only */

/* Spacing scale (4px base) */
--space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
--space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
--space-12: 48px; --space-16: 64px; --space-20: 80px;

/* Typography */
--font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
--font-decorative: "Caveat", "Segoe Script", cursive; /* hero callout ONLY */

--fs-hero:        40px; /* line-height 1.15, weight 700 */
--fs-section:      24px; /* line-height 1.3,  weight 700 */
--fs-card-title:   17px; /* line-height 1.3,  weight 600 */
--fs-component:    15px; /* line-height 1.4,  weight 600 */
--fs-body:         15px; /* line-height 1.6,  weight 400 */
--fs-meta:         13px; /* line-height 1.4,  weight 400/500 */

/* Max content width */
--content-max-width: 1280px;
--content-padding-x: 24px; /* desktop gutters */
```

Do not introduce any hex value outside this table. If a coding agent needs an intermediate shade (e.g., hover state), derive it via opacity or a documented darken/lighten of an existing token (see §14 Interaction States) rather than inventing a new hex.

---

## 1. Page Structure & Section Hierarchy

Single scrollable public homepage (`app/routes/home`), composed top to bottom of the following **top-level landmark regions**, each a distinct component:

```
1. <Header>                       — layout/Header
2. <HeroSection>                  — hero/HeroSection
     2.1 Headline + description + decorative callout
     2.2 <SearchConsole>          — hero/SearchConsole
     2.3 <EmergencyPresets>       — hero/EmergencyPresets
3. <FeatureGrid>                  — features/FeatureGrid
4. <MainContent>                  — app/layout (2-col grid wrapper)
     4.1 <HospitalResultsSection> — hospitals/HospitalList (+ header/sort)
     4.2 <Sidebar>                — sidebar/*
         - <EmergencyCallout>
         - <HospitalPortalCard>
         - <MottoCard>
5. <Footer>                       — layout/Footer
```

Each numbered region is full-viewport-width for its background, with an inner content wrapper constrained to `--content-max-width` (1280px), horizontally centered, with `--content-padding-x` (24px) gutters on desktop. Sections 1 and 5 are the only two regions that intentionally break out of the light page background (§2, §11).

---

## 2. Global Layout & Page Background

- Page background: `--color-page-bg` (#F8FAFC) for everything between Header and Footer, **except** the Hero region, which uses `--color-brand-light` (#EAF4F9) as a full-bleed band behind the hero image, extending from the bottom of the header to the bottom of the feature-value bar's top edge.
- Content wrapper: `max-width: 1280px; margin-inline: auto; padding-inline: 24px;` — reused as a `<Container>` primitive by every section.
- Vertical rhythm between top-level sections: `--space-16` (64px) desktop, `--space-10` (40px) mobile — except Header/Footer, which have no external vertical margin (they are edge-to-edge bands).

---

## 3. Header (`layout/Header`)

**Container:** full-width band, background `--color-brand-navy` (#0E4366), height `72px`, no border, no shadow (a 1px darker bottom hairline `rgba(255,255,255,0.08)` is optional but not required).

**Inner layout:** flex row, `justify-content: space-between; align-items: center;` inside the 1280px content wrapper, `padding-inline: 24px`.

**Left cluster (logo + wordmark + tagline):**
- Logo: medical-plus badge icon, 36×36px, rounded square (`radius-sm`), icon color white on a `--color-brand-blue` fill (or gradient-free flat fill — no gradients per anti-vibe rules).
- Wordmark "MediTrack": 20px, weight 700, white, immediately right of logo with 8px gap.
- Tagline "Emergency Resources | When It Matters": 12px, weight 400, color `rgba(255,255,255,0.75)`, stacked as two lines (or one line with a vertical divider `|` at 60% opacity) directly right of the wordmark cluster with a 16px left margin; hidden below `768px`.

**Center cluster (primary nav):**
- Items: Home, Hospitals, About, Contact — horizontal flex, `gap: 32px`.
- Each item: 15px, weight 500, color `rgba(255,255,255,0.85)`; active/current page (Home) is full-opacity white with a 2px solid white underline offset 8px below the text (`text-underline-offset`), no background pill.
- Inactive items have no underline in default state.
- Nav is horizontally centered in the header, independent of the left/right clusters (use `position: absolute; left: 50%; transform: translateX(-50%)` or a 3-column CSS grid `auto 1fr auto`).

**Right cluster (Hospital Staff Login):**
- Pill button: `radius-pill`, `padding: 10px 20px`, `border: 1px solid rgba(255,255,255,0.4)`, background transparent, text white 14px weight 500, with a small user/person icon (16px) preceding the label, 8px icon-label gap.
- This is the **only** rounded-pill element in the header — nav links and logo container use their own radii per §0, not pill.

**Mobile (`<768px`):**
- Collapses to: Logo+wordmark (tagline hidden) on the left, a hamburger icon button (44×44px tap target) on the right.
- Tapping hamburger opens `layout/MobileNavigation`: a full-height slide-in panel (or dropdown) from the right, background `--color-brand-navy`, containing the four nav links stacked (each a 52px-tall tap row) followed by a full-width "Hospital Staff Login" pill button with 16px top margin.

---

## 4. Hero Section (`hero/HeroSection`)

**Container:** background `--color-brand-light`, `padding-block: 64px 0` (bottom padding is 0 because the search console visually straddles the hero/feature-bar boundary — see §6). On mobile, `padding-block: 40px 0`.

**Layout:** two-column grid on desktop — `grid-template-columns: 1.05fr 1fr; gap: 48px; align-items: center;` Left column = text + search console + presets. Right column = hero photograph.

### 4.1 Left column — Headline block
- Headline, two lines, `--fs-hero` (40px desktop / 30px mobile), weight 700, line-height 1.15, color `--color-text-primary` for line 1 ("Find Nearby "), with the word **"Hospitals."** and, on line 2, **"Get Real-Time Resource Availability."** styled with the emphasis word(s) in `--color-brand-blue`. Concretely:
  - Line 1: `Find Nearby ` (navy #0F172A) + `Hospitals.` (brand-blue #1877A9)
  - Line 2: `Get Real-Time ` (navy) + `Resource Availability.` (brand-blue)
- Margin-bottom: 16px.
- Description paragraph: `--fs-body` (15px), color `--color-text-secondary`, `max-width: 480px`, line-height 1.6, margin-bottom `32px`. Exact copy from DESIGN.md §10.

### 4.2 Right column — Hero image
- Single photograph (hospital corridor), `border-radius: --radius-lg` (16px), `aspect-ratio: 4/3` desktop, `object-fit: cover`, full column width.
- Decorative handwritten callout ("Right hospital. / Right resources. / Faster care.") is absolutely positioned in the **bottom-right ~25%** of the image, overlapping the image edge slightly to the right as in the reference: `font-family: --font-decorative`, 22px, color white, `text-shadow: 0 1px 3px rgba(0,0,0,0.3)` for legibility over the photo, with a single thin underline stroke beneath the last line (rendered as an inline SVG or `border-bottom` on the last `<span>`). This text block is `aria-hidden="true"` (purely decorative, per DESIGN.md §10).
- On mobile, this decorative callout is **removed entirely** (not stacked, not shrunk) to avoid competing with the search console — mobile hero shows only the image, cropped to `aspect-ratio: 16/9`.

### 4.3 Search Console — see §5 (physically inside the left column, but documented separately because it's the primary interaction)

### 4.4 Emergency Presets — see §6 (directly below Search Console, inside left column, full column width)

**Mobile layout:** single column. Order: Headline → Description → **Search Console** → **Presets** → Hero image is **omitted on mobile** (per DESIGN.md mobile order in §29, images are secondary to the search task; if the coding agent's existing mobile build already shows a cropped hero image above the headline, keep it, but it must never appear between the headline and the search console).

---

## 5. Search Console (`hero/SearchConsole`)

This is the **primary interaction** of the page and must have the strongest visual containment on screen.

**Container:**
- Background `--color-surface` (#FFFFFF), `border: 1px solid --color-border`, `border-radius: --radius-lg` (16px), `box-shadow: --shadow-sm`.
- Padding: `20px 24px`.
- Width: 100% of the left column (desktop), full-bleed minus 16px side gutters on mobile.
- Positioned with `margin-top: 32px` below the description paragraph.

**Internal layout (desktop ≥1024px):** single horizontal row, 4 segments separated by 1px vertical dividers (`--color-border`), using `display: grid; grid-template-columns: 1fr 1fr 1fr auto; align-items: center;`

1. **Emergency Type** field
2. **Required Resources** field
3. **Location** field
4. **Search** button

Each of the three input segments (1–3) shares this internal structure:
```
[icon 18px]  Label (11px, --color-text-muted, uppercase optional, weight 500)
             Value (15px, --color-text-primary, weight 500)
             [chevron-down 14px, right-aligned]         ▸ segments 1–2 only
```
- Icon: 18×18px, color `--color-brand-blue`, left-aligned, vertically centered against the two-line label/value stack, 10px gap to text.
- Segment padding: `12px 16px`.
- Segment 1 (Emergency Type): icon = ambulance/trauma icon; label "Emergency Type"; value "Accident / Trauma"; trailing chevron-down (this is a `<Select>`).
- Segment 2 (Required Resources): icon = medical-kit icon; label "Required Resources"; value "ICU, Ventilator, CT Scan" (comma-joined selected resource labels, truncate with `…` if it would exceed segment width); trailing chevron-down (multi-select `<Select>`).
- Segment 3 (Location): icon = location-pin icon (color `--color-brand-blue`); label "Your Location"; value/placeholder "Use my location" in `--color-text-muted` when unset, or the resolved location label in `--color-text-primary` once set; trailing icon = GPS/crosshair icon (18px, `--color-brand-blue`, clickable, triggers geolocation — separate `aria-label="Use my current location"` button, not part of the text flow).
- Segment 4 (Search button): `<Button variant="primary">`, background `--color-brand-navy`, text white, `padding: 14px 28px`, `border-radius: --radius-pill`, `font-size: 15px; font-weight: 600;`, search icon (18px) + "Search" label, 8px icon-label gap. `margin-left: 16px` from the last divider (button is not divided by a hairline, it floats as a distinct CTA).

**Tablet (768–1023px):** grid becomes 2 columns × 2 rows: `[Emergency Type][Required Resources]` / `[Location][Search]`, dividers become horizontal between rows and vertical only within a row; Search button becomes full-width of its cell.

**Mobile (<768px):** single column stack, each segment full-width, `border-bottom: 1px solid --color-border` instead of vertical dividers (last segment before button has no border), Search button full-width `height: 52px` pill, `margin-top: 12px`.

**States:**
- Segment hover (desktop): background tint `--color-page-bg` on the hovered segment only, `cursor: pointer`.
- Segment focus (keyboard): `outline: 2px solid --color-brand-blue; outline-offset: -2px;` — visible, never suppressed.
- Open dropdown (Emergency Type / Required Resources): renders a `<Select>` panel directly below the segment, `background: white; border: 1px solid --color-border; border-radius: --radius-sm; box-shadow: --shadow-sm; margin-top: 4px; z-index: 20;` Options list, each option row 40px tall, `padding-inline: 16px`, hover bg `--color-page-bg`, selected option shows a trailing check icon (16px, `--color-brand-blue`) and text weight 600.
- Search button hover: background darkens to `#0B3A57` (a documented 8% darken of brand-navy — see §14). Active/pressed: `transform: translateY(1px)`. Disabled (no location + no resource selected, if the product requires it): `opacity: 0.5; cursor: not-allowed;` — only apply disabled state if ARCHITECTURE.md validation rules require it; otherwise Search is always enabled and defers empty-state handling to results section.

---

## 6. Emergency Presets (`hero/EmergencyPresets`)

**Container:** horizontal flex row, `gap: 12px`, `flex-wrap: wrap` on mobile, `margin-top: 16px` below the Search Console, full width of left column.

**Chip (`<Badge>`/pill button), one per preset — "Accident / Trauma", "Heart Emergency", "Breathing Crisis", "Burn Injury":**
- Shape: `border-radius: --radius-pill`, `padding: 10px 18px`, `display: inline-flex; align-items: center; gap: 8px;`
- Icon: 16px, matched to concept (car-crash/trauma, heart, lungs, flame) — one consistent icon family only.
- Label: 14px, weight 500.
- **Default (inactive) state:** background `--color-surface`, border `1px solid --color-border`, text `--color-text-secondary`, icon `--color-text-muted`.
- **Selected/active state** (e.g., "Accident / Trauma" in the reference): background `--color-brand-subtle` (#DCEBF5), border `1px solid transparent` (or `1px solid --color-brand-subtle`), text `--color-brand-navy` (#0E4366), icon `--color-brand-navy`, `font-weight: 600`.
- Only one preset is selected at a time; selecting a preset updates the Search Console's Emergency Type + Required Resources segments to match (per ARCHITECTURE.md §10 preset → search-state mapping). This is a controlled interaction, not a visual-only toggle.
- Hover (inactive chip): background `--color-page-bg`, border color unchanged.
- Focus: `outline: 2px solid --color-brand-blue; outline-offset: 2px;`

**Mobile:** chips wrap to 2 rows of 2 (or scroll horizontally as a last resort — wrapping is preferred over horizontal scroll for accessibility). Minimum tap target height: 40px.

---

## 7. Feature Value Bar (`features/FeatureGrid`)

**Container:** full-width band, background `--color-page-bg` (transition point from hero's light-blue to the neutral page background), `padding-block: 40px`, sits directly below the Hero region (no gap, this band and the hero region share a visual seam at the bottom edge of the hero image row).

**Layout:** 4-column horizontal grid on desktop, `grid-template-columns: repeat(4, 1fr); gap: 32px;` inside the 1280px content wrapper. This is **explicitly not** a 4-card grid — no card backgrounds, no borders, no shadows around each item. It reads as one continuous value-prop row separated only by whitespace (optionally a 1px vertical divider `--color-border` between items, 60% height, centered — reference image does not show dividers, so default to **no dividers**, whitespace only).

**Each item:**
```
[icon circle 44px]   Title (15px, weight 600, --color-text-primary)
                      Description (13px, weight 400, --color-text-secondary, line-height 1.5)
```
- Layout: `display: flex; align-items: flex-start; gap: 14px;`
- Icon circle: 44×44px, `border-radius: 50%`, background `--color-brand-light` (#EAF4F9), icon 20px centered, icon color `--color-brand-blue`.
- Items: (1) Lightning icon / "Real-Time Availability" / "See live resource status with freshness timestamps." (2) Location-pin icon / "Nearby Hospitals" / "Find the closest verified hospitals in your area." (3) Shield icon / "Verified & Reliable" / "Only trusted hospitals with real-time data." (4) Phone icon / "Direct Contact" / "Get call details and directions instantly."

**Tablet (768–1023px):** 2×2 grid, `gap: 24px 32px`.
**Mobile (<768px):** single column stack, `gap: 24px`, each item's icon circle shrinks to 40px, left-aligned same as desktop (icon-left, text-right — never centered/stacked).

---

## 8. Main Content Grid (Hospital Results + Sidebar)

**Container:** inside 1280px wrapper, `padding-block: 40px`, `display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start;`

- Left column (hospital results): flexible width, contains `hospitals/HospitalList`.
- Right column (sidebar): fixed `340px`, contains the three sidebar widgets stacked with `gap: 20px`, and uses `position: sticky; top: 88px;` (72px header height + 16px breathing room) so it stays in view while results scroll, **only on desktop ≥1280px** — do not apply sticky below that breakpoint to avoid overlap bugs.

**Tablet (768–1279px):** single column; grid-template-columns collapses to `1fr`; sidebar renders **below** the hospital results list (per DESIGN.md §29), sticky positioning removed, `gap: 32px` between the two stacked blocks.

**Mobile (<768px):** identical single-column stacking, `gap: 24px`.

---

## 9. Hospital Results Section Header

Sits directly above the hospital card list, inside the left column.

**Layout:** flex row, `justify-content: space-between; align-items: flex-end;`, `margin-bottom: 20px`.

**Left cluster:**
- Small location-pin icon (16px, `--color-brand-blue`) + "Nearby Hospitals" title, `--fs-section` (24px would be too large here relative to reference — use 20px, weight 700, `--color-text-primary`), icon and title on the same baseline row, 8px gap.
- Subtitle directly below: "Showing hospitals near your location with available resources", 14px, `--color-text-secondary`, `margin-top: 4px`.

**Right cluster (Sort control):**
- `<Select>` styled as a **text-button**, not a boxed dropdown: "Sort by:" label (13px, `--color-text-muted`) + value "Nearest" (13px, weight 600, `--color-text-primary`) + chevron-down (12px), all inline, optional thin border wrapper `1px solid --color-border; border-radius: --radius-sm; padding: 8px 12px;` to keep it tappable — must remain visually secondary (smaller font, no fill color) relative to the section title per DESIGN.md §14.

**Mobile:** same row layout retained (do not stack title above sort control vertically) as long as it fits ≥360px; if it wraps, sort control moves to its own row below the subtitle, right-aligned.

---

## 10. Hospital Card (`hospitals/HospitalCard`) — reusable component

This is the single most-repeated component; every visual rule here must be token-driven and prop-driven (per ARCHITECTURE.md Rule 3/4 — never hard-code hospital data or one-off styles per card).

**Card container:**
- `background: --color-surface; border: 1px solid --color-border; border-radius: --radius-md (12px); box-shadow: --shadow-xs;` (subtle, only escalate to `--shadow-sm` on hover — see §14).
- `padding: 20px 24px`.
- `margin-bottom: 16px` between stacked cards (or use `gap: 16px` on the parent `HospitalList` flex/grid container instead of margin).

**Internal layout (desktop ≥1024px):** 3-column horizontal grid:
```
grid-template-columns: 96px 1fr 200px;
gap: 20px;
align-items: start;
```

**Column A — Image (96×96px):**
- `border-radius: --radius-sm (8px); object-fit: cover;` building/exterior photo.
- `flex-shrink: 0`.

**Column B — Identity + Resource Grid (flexible width):**
1. **Name row:** hospital name `--fs-card-title` (17px, weight 600, `--color-text-primary`) + verified badge icon (14px checkmark inside a small `--color-brand-blue` filled circle, 16px total) inline right after the name, 6px gap. Badge must stay visually **secondary** to the name — same line, smaller size, not bold.
2. **Distance row** (`margin-top: 6px`): location-pin icon (14px, `--color-text-muted`) + "2.8 km away" (13px, `--color-text-secondary`), inline, 6px gap.
3. **Address row** (`margin-top: 2px`): map-pin/building icon (14px, `--color-text-muted`) + "MG Road, Kochi, Kerala" (13px, `--color-text-secondary`), inline, 6px gap.
4. **Last updated row** (`margin-top: 6px`): rendered as a small pill/badge, not plain text — clock icon (12px) + "Last updated 2 mins ago" (12px, weight 500), `background: --color-page-bg; border-radius: --radius-sm; padding: 4px 10px; display: inline-flex; gap: 4px; color: --color-text-muted;`. **Staleness rule (ARCHITECTURE.md §6):** if the hospital's underlying `lastUpdated` exceeds a defined staleness threshold (e.g., >30 min — confirm with data layer), this pill switches to the **stale treatment**: `background: --color-stale-bg; color: --color-stale-text; border: 1px solid --color-stale-border;` and the clock icon is replaced with a warning-triangle icon. This must never look identical to the fresh/default pill.
5. **Resource Status Grid** (`margin-top: 14px`): see §11 below, rendered as a 2-column grid within Column B, full width of the column.

**Column C — Actions (200px, right-aligned):**
- Stacked vertically, `gap: 8px`, `align-items: stretch` on desktop so both controls share the same width (200px).
1. **Call Hospital** — primary action, `<Button variant="secondary-filled">`: background `--color-brand-blue` (#1877A9), text white, `padding: 12px 16px; border-radius: --radius-sm (8px* — not pill, despite Search button being pill; Call Hospital is a card-level action and uses the sm/md radius family, matching the reference image's rectangular-but-rounded shape)`, phone icon (16px) + "Call Hospital" (14px weight 600), icon-label gap 8px, full width of Column C.
2. **View Details →** — secondary action, text-only link style: `padding: 8px 16px`, 13px, weight 500, color `--color-brand-blue`, no background/border, right-aligned text with trailing arrow icon (12px) with 4px gap, `text-align: center` to match button width. Must render visually lighter than Call Hospital (no fill, smaller footprint) per DESIGN.md §19.

**Tablet (768–1023px):** Column A shrinks to 72×72px; 3-column grid becomes `72px 1fr`, and Column C (actions) drops to a **full-width row below** Column B, laid out horizontally: Call Hospital (flex:1) + View Details (auto width) side by side, `gap: 12px`, `margin-top: 16px`.

**Mobile (<768px):** single column stack —
```
[Image 100% width, height 160px, object-fit cover, radius-sm]
[Name + verified badge]
[Distance]
[Address]
[Last updated pill]
[Resource Status Grid — 2 columns retained, do not go to 1 column]
[Call Hospital — full width button, height 48px]
[View Details → — full width, centered, margin-top 8px]
```
Per ARCHITECTURE.md §22, cards must **not** become horizontally compressed — always switch to this full vertical stack below 768px rather than shrinking the 3-column grid proportionally.

---

## 11. Resource Status Grid (`hospitals/ResourceStatusGrid` + `ResourceStatus`)

**Container:** `display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 24px;` — always 2 columns regardless of breakpoint (per §10 mobile note).

**Section label (optional, only if card design calls for it):** "Available Resources" 12px, weight 600, `--color-text-muted`, `text-transform: uppercase; letter-spacing: 0.03em;`, `margin-bottom: 8px`, spans full grid width.

**Each `ResourceStatus` row (one per resource — Emergency Dept, ICU, Ventilator, CT Scan, Blood, etc.):**
```
[status icon 14px]  Resource name (13px, --color-text-secondary)   Status label (13px, weight 600, status color)
```
- Layout: `display: flex; align-items: center; justify-content: space-between; gap: 8px;` — icon+name on the left, status label right-aligned within its grid cell.
- **Available:** icon = filled checkmark circle, color `--color-available` (#16A34A); status label text "Available", color `--color-available`.
- **Unavailable:** icon = filled X circle, color `--color-unavailable` (#DC2626); status label text "Unavailable", color `--color-unavailable`.
- **Unknown:** icon = filled "?" circle or outline circle, color `--color-unknown` (#64748B); status label text "Unknown", color `--color-unknown`.
- **Stale:** icon = warning triangle, color `--color-stale-text`; status label text "Data may be outdated" or resource name suffixed with "(stale)"; row background may get a very subtle `--color-stale-bg` tint at low opacity (e.g. 40%) applied as `background` on the row only, not the whole card.
- **Critical accessibility rule (DESIGN.md §18, ARCHITECTURE.md §23):** color is never the sole indicator — the icon shape (check vs X vs ? vs triangle) and the text label ("Available"/"Unavailable"/"Unknown"/stale phrasing) must always accompany the color. Never render a bare colored dot.
- Resource name text truncates with `text-overflow: ellipsis; white-space: nowrap;` if needed, never wraps to 2 lines within the grid cell.

---

## 12. Sidebar (`sidebar/*`)

Three stacked widgets, `gap: 20px`, each `border-radius: --radius-md (12px)`, no external card shadow beyond `--shadow-xs` (or none at all — these are calmer than the hospital cards).

### 12.1 Emergency Widget (`sidebar/EmergencyCallout`)
- Background: `--color-brand-light` (#E0EEF7 per DESIGN.md §21 — treat as an allowed near-duplicate of `--color-brand-light`; use `#E0EEF7` exactly for this widget only, do not generalize it as a new token beyond this component).
- Padding: `20px`.
- Layout: icon circle (44px, `background: --color-brand-dark (#0B3553); border-radius: 50%;`, white EKG/pulse icon 20px centered) + heading "Emergency?" (16px, weight 700, `--color-text-primary`) on the same row, `gap: 12px`, `align-items: center`.
- Description below (`margin-top: 10px`): "Need immediate help? Call 108 or visit the nearest emergency department." — 13px, `--color-text-secondary`, line-height 1.5.
- CTA below (`margin-top: 14px`): "Emergency Contacts →" rendered as a solid pill/rect button: `background: --color-brand-dark; color: white; padding: 10px 16px; border-radius: --radius-sm; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;` (arrow icon trailing).
- Must feel **prominent, not alarming**: no red, no pulsing animation, no oversized icon.

### 12.2 Hospital Portal Widget (`sidebar/HospitalPortalCard`)
- Background: `--color-surface`, `border: 1px solid --color-border`.
- Layout: text block (top) + supporting image (bottom), OR image as a background with overlay — reference shows a photo strip at the bottom third of the widget with a gradient/overlay for legibility if text overlaps it; **preferred implementation:** text block on `--color-surface` background in the top ~65% (`padding: 20px 20px 0`), image fills the bottom ~35% (`height: 96px; object-fit: cover; border-radius: 0 0 --radius-md --radius-md;` full bleed to widget edges), no text overlapping the image.
- Heading: "For Hospitals" 16px weight 700.
- Description (`margin-top: 8px`): "Access your dashboard, manage resources and connect IoT devices." 13px `--color-text-secondary`.
- Action (`margin-top: 12px`, before the image): "Staff Login →" text link, 13px weight 600, `--color-brand-blue`, trailing arrow icon 12px.
- Bottom padding before image starts: 16px.

### 12.3 Motto Widget (`sidebar/MottoCard`)
- Background: `--color-brand-light` (#EAF4F9).
- Padding: `20px`.
- Large decorative opening quote mark (`"`) — 32px, `--color-brand-blue` at reduced opacity (~30–40%), positioned top-left, `line-height: 0.6`, purely decorative (`aria-hidden="true"`).
- Quote text below: "Better information. / Better decisions. / More lives saved." — 15px, weight 600, `--color-text-primary`, line-height 1.5, three lines as shown (either hard line breaks or natural wrap at the widget's width — reference shows deliberate line breaks, so use `<br/>` or block-level spans per phrase).
- Subtle pulse/heartbeat SVG line graphic anchored bottom-right of the widget, `stroke: --color-brand-blue`, low opacity (~50%), `width: ~80px`, purely decorative, must stay behind/beside the text, never overlapping it.

**Sidebar mobile/tablet order:** unchanged relative order (Emergency → Hospital Portal → Motto), stacked below the hospital results list per §8.

---

## 13. Footer (`layout/Footer`)

- Full-width band, background `--color-brand-dark` (#0B3553), `padding-block: 40px`.
- Inner content wrapper same 1280px/24px-gutter container as other sections.
- Layout: `display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;`
  - **Left cluster:** logo badge (28px, same mark as header) + "MediTrack" (16px weight 700, white) stacked with "Emergency Resources Platform" (12px, `rgba(255,255,255,0.65)`) directly beneath, OR inline per reference (logo+name on one line, tagline as smaller text immediately after with a bullet/pipe separator) — match the reference's single-row compact treatment: logo + "MediTrack" + " · Emergency Resources Platform" all on one baseline, tagline in muted light-blue-gray.
  - **Center cluster:** nav links "Home · Hospitals · About · Contact", 13px, `rgba(255,255,255,0.75)`, `gap: 24px`, hover → full white + underline.
  - **Right cluster:** "© 2025 MediTrack. All rights reserved." 12px, `rgba(255,255,255,0.55)`.
- Mobile: stack the three clusters vertically, centered, `gap: 20px`, `text-align: center`.

---

## 14. Interaction States (apply to every interactive component)

Define exactly these five states per component; do not skip any:

| State | Rule |
|---|---|
| Default | As specified per component above. |
| Hover | Background/text shifts by one token step (e.g., surface → page-bg tint; brand-blue → 8% darken `#166B95`; brand-navy → 8% darken `#0B3A57`); `transition: background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;` — never introduce a new shadow tier beyond `--shadow-sm`→`--shadow-md` on hover for cards. |
| Focus (keyboard) | `outline: 2px solid --color-brand-blue; outline-offset: 2px;` (or `-2px` for inset controls like search-console segments). Never `outline: none` without a replacement. Applies identically across mouse/touch-derived `:focus-visible`. |
| Active/pressed | `transform: translateY(1px)` for buttons; no color change required beyond hover state. |
| Disabled | `opacity: 0.5; cursor: not-allowed; pointer-events: none;` (only for controls that can legitimately be disabled per the data layer, e.g., Call Hospital when no phone number exists — in that case render the button disabled with a `title`/`aria-label` explaining why, rather than hiding it). |

**Card-level hover** (`HospitalCard`, sidebar widgets if clickable): `box-shadow: --shadow-sm → --shadow-md` is too strong per DESIGN.md §26 "avoid excessive shadow" — instead use a **border-color shift**: `border-color: --color-border → --color-brand-blue` at 30% opacity, plus `transform: translateY(-1px)`, `transition: 150ms ease`. This satisfies "small card hover elevation" (DESIGN.md §31) without violating the "subtle shadow only" rule.

---

## 15. Icons

- Single icon library across the entire app (e.g., Lucide/Feather-style outline icons at consistent stroke-width — pick one and use it everywhere; do not mix filled and outline styles except where status icons intentionally use filled circles per §11).
- Required concepts (map each to one canonical icon, reused everywhere that concept appears): medical-cross, user, search, map-pin/location, crosshair/GPS, heart, lungs, flame, car-crash/trauma, lightning-bolt, shield, phone, check-circle, x-circle, chevron/arrow, activity/EKG-pulse, medical-kit/briefcase-medical, clock, warning-triangle.
- Never use emoji as functional UI icons anywhere (headings, buttons, statuses, nav). Emoji-style glyphs are prohibited per DESIGN.md §34.
- Icon sizing scale used throughout this spec: `12px` (inline micro), `14–16px` (inline with text), `18–20px` (form/segment icons), `44px` (circular feature/widget icon containers, icon itself 20–24px inside).

---

## 16. Responsive Breakpoints (canonical — use across all components)

```
--bp-mobile:  up to 767px
--bp-tablet:  768px  to 1023px
--bp-desktop: 1024px to 1279px
--bp-wide:    1280px and above (content wrapper reaches its max-width and centers)
```

**Global mobile composition order** (confirmed, matches DESIGN.md §29 and ARCHITECTURE.md §22):
```
Header
Hero (headline → description → Search Console → Presets; hero photo cropped or omitted)
Feature Value Bar
Hospital Results (list header + stacked cards)
Sidebar: Emergency Widget → Hospital Portal Widget → Motto Widget
Footer
```

---

## 17. Accessibility Checklist (binding, not optional)

- All interactive elements reachable via `Tab`, in visual/logical DOM order matching the responsive layout at each breakpoint (reorder via DOM, not CSS-only `order`, wherever feasible).
- `Header` nav is a `<nav aria-label="Primary">`; mobile menu toggle has `aria-expanded` and `aria-controls`.
- `SearchConsole` fields are real `<label>`-associated form controls (`<Select>`/`<Input>`), not divs with click handlers.
- Every `ResourceStatus` row exposes status via text (already specified) — screen readers must never rely on color/icon alone; consider `aria-label="ICU: Available"` on the row for redundancy.
- "Last updated" / stale pill includes the full phrase in the accessible name, not just an icon.
- Hospital card image `alt` = hospital name + "building exterior" (never empty, never generic "image").
- Decorative-only elements (`hero callout`, quote mark, heartbeat SVG) get `aria-hidden="true"` and are not in tab order.
- Color contrast: all text-on-background pairs in §0 meet WCAG AA at their respective sizes (this token set was chosen to satisfy that — do not lighten `--color-text-secondary`/`--color-text-muted` further).
- Touch targets ≥ 44×44px on mobile for every button/link/chip/icon-button, including the GPS crosshair icon-button inside the Location segment.

---

## 18. Loading / Empty / Error States (visual only — logic lives in hooks/repository per ARCHITECTURE.md)

- **Loading (`ui/LoadingState`):** render skeleton `HospitalCard` shapes (gray `--color-border`-toned rounded blocks matching the real card's column proportions) — minimum 2–3 skeleton cards, pulsing opacity animation `1 ↔ 0.6` over 1.2s, `ease-in-out`, infinite — this is the **only** permitted "constant" animation, and only while loading. Never render fully empty/blank cards while waiting.
- **Empty state:** centered block inside the hospital-results column, icon (e.g., search/map-pin outline, 40px, `--color-text-muted`), heading "No matching hospitals found." (16px weight 600), followed by the bulleted suggestions from ARCHITECTURE.md §25 rendered as a simple `<ul>` (14px, `--color-text-secondary`), `padding-block: 48px`, centered text, no illustration/mascot.
- **Error state:** same centered treatment, warning-triangle icon in `--color-unavailable`-tinted circle (use a muted 10%-opacity red background, not full red fill, to avoid implying a resource-unavailable status), heading "We couldn't load hospital availability." + "Please try again." + a `<Button variant="outline">` "Retry" (border `--color-border`, text `--color-text-primary`, background transparent, hover → `--color-page-bg`).

---

## 19. Component-to-Token Reuse Map (for the coding agent)

To satisfy ARCHITECTURE.md Rule 4/5 (reusable components, no duplicated tokens), the following primitives from `components/ui/` must be the single implementation shared everywhere:

| Primitive | Used by |
|---|---|
| `<Button variant="primary">` (navy, pill) | Search button |
| `<Button variant="secondary-filled">` (brand-blue, radius-sm) | Call Hospital |
| `<Button variant="text">` (brand-blue, no fill) | View Details, Staff Login link |
| `<Button variant="outline">` | Retry (error state), Emergency Contacts if a lighter treatment is ever needed |
| `<Badge>` | Emergency preset chips, verified checkmark, last-updated pill, stale pill |
| `<Select>` | Emergency Type, Required Resources, Sort by |
| `<Input>` | Location field (if it becomes free-text search rather than button-only) |
| `<Icon>` | Every icon usage described in §15, single wrapper component controlling size/color via props |

No section above should hand-roll a one-off button or badge style; every colored pill/button in this spec maps to one of the rows above with variant props (`background`, `radius`, `size`) — not new component files.

---

## 20. Explicit Non-Goals (guardrails for the implementing agent)

- Do not add card shadows beyond `--shadow-xs`/`--shadow-sm` anywhere in this spec.
- Do not round every element — Search button and preset chips and Staff Login are the **only** pill-radius elements; everything else uses `--radius-sm`/`--radius-md`/`--radius-lg` per §0.
- Do not introduce gradients or glassmorphism (no `backdrop-filter`, no multi-stop background gradients) anywhere, including the hero image overlay — use a flat `rgba(0,0,0,x)` scrim only if legibility requires it behind the decorative callout.
- Do not animate anything continuously except the loading skeleton (§18).
- Do not let the sidebar widgets, feature bar items, or resource grid rows use red/green outside the exact `--color-available`/`--color-unavailable` semantic contexts defined in §11.
- Do not hard-code any of the mock hospital copy (§10 example: "City General Hospital", "2.8 km away", etc.) inside `HospitalCard.tsx` — it must arrive via the `Hospital` prop per ARCHITECTURE.md §3/§7.
