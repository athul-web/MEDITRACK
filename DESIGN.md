# MediTrack — UI & Design System

## 1. Design Objective

MediTrack is a public-facing healthcare emergency resource discovery platform.

The interface must feel like a **real healthcare product**, not a generic AI-generated dashboard or template.

The visual language should communicate:

* Trust
* Speed
* Clarity
* Medical professionalism
* Reliability
* Accessibility
* Calmness during high-stress situations

The interface should prioritize information that matters during an emergency.

The user should be able to understand the following within seconds:

1. What MediTrack does.
2. What emergency/resource they are searching for.
3. Where they are searching.
4. Which hospitals have the required resources.
5. Whether those resources are available.
6. How recently the information was updated.
7. How to contact the hospital.

---

# 2. Visual Direction

## Overall Style

Use a:

* Clean
* Clinical
* Modern
* Editorial
* Professional
* Information-first

visual language.

The design should NOT look like a SaaS admin dashboard.

Avoid excessive:

* Rounded cards
* Glassmorphism
* Gradients
* Floating blobs
* Neon colors
* Excessive shadows
* Decorative animations
* Oversized icons
* Random illustrations
* Generic dashboard patterns

The interface should feel intentionally designed rather than generated from a UI template.

---

# 3. Brand Identity

## Brand

**MediTrack**

## Tagline

`Emergency Resources | When It Matters`

## Brand Symbol

Medical plus sign contained inside a stylized badge.

The logo should be simple, recognizable, and usable at small sizes.

Use the same logo treatment consistently across:

* Header
* Footer
* Mobile navigation
* Login entry points

---

# 4. Color System

Use these colors as the canonical design tokens.

Do not introduce arbitrary colors when an existing token can fulfill the purpose.

## Primary Brand

```text
brand-navy
#0E4366
```

Primary use:

* Header
* Search button
* Important dark CTA
* Primary brand elements

---

```text
brand-dark
#0B3553
```

Primary use:

* Footer
* Emergency CTA
* Deep accents
* High-emphasis dark elements

---

```text
brand-blue
#1877A9
```

Primary use:

* Call Hospital
* Interactive highlights
* Active states
* Medical icon backgrounds
* Secondary CTA elements

---

## Light Brand Colors

```text
brand-light
#EAF4F9
```

Use for:

* Hero background
* Large informational surfaces
* Light blue sections

---

```text
brand-subtle
#DCEBF5
```

Use for:

* Selected filters
* Active search values
* Soft badges
* Secondary highlights

---

# 5. Status Colors

## Available

```text
#16A34A
```

Use exclusively for resource availability.

Example:

```text
✓ Available
```

---

## Unavailable

```text
#DC2626
```

Use exclusively for unavailable resources.

Example:

```text
✕ Unavailable
```

Do not use green or red as decorative colors.

---

## Unknown

Use a neutral color.

Example:

```text
? Unknown
```

---

## Stale

Use a neutral warning treatment.

Example:

```text
! Data may be outdated
```

A stale resource must never visually appear equivalent to a confirmed available resource.

---

# 6. Neutral Colors

## Page Background

```text
#F8FAFC
```

## Card Surface

```text
#FFFFFF
```

## Primary Text

```text
#0F172A
```

## Secondary Text

```text
#475569
```

## Muted Text

```text
#64748B
```

## Border

```text
#E2E8F0
```

---

# 7. Typography

Typography should prioritize readability and information hierarchy.

Use a modern professional sans-serif typeface.

Recommended hierarchy:

```text
Hero Heading
↓
Section Heading
↓
Hospital Name
↓
Component Heading
↓
Body Text
↓
Metadata
```

Use strong weight differences rather than excessive font sizes.

Critical medical/resource information must always use highly readable typography.

Avoid using decorative handwritten fonts for:

* Resource status
* Hospital names
* Emergency instructions
* Important buttons
* Medical information

The handwritten hero callout may be decorative only.

---

# 8. Layout Philosophy

Use a structured responsive grid.

Desktop layout:

```text
┌──────────────────────────────────────────────┐
│                   HEADER                     │
├──────────────────────────────────────────────┤
│                    HERO                      │
│                                              │
│             SEARCH CONSOLE                   │
├──────────────────────────────────────────────┤
│             FEATURE VALUE BAR                │
├───────────────────────────────┬──────────────┤
│                               │              │
│       HOSPITAL RESULTS        │   SIDEBAR    │
│                               │              │
│                               │              │
├───────────────────────────────┴──────────────┤
│                    FOOTER                    │
└──────────────────────────────────────────────┘
```

The content area should have a comfortable maximum width.

Do not stretch content across the entire viewport.

---

# 9. Header

## Structure

```text
Logo + MediTrack + Tagline
              |
Home | Hospitals | About | Contact
              |
Hospital Staff Login
```

## Appearance

Background:

```text
#0E4366
```

Text:

```text
#FFFFFF
```

Navigation should be understated.

The Hospital Staff Login button should use a pill shape while the rest of the navigation remains visually restrained.

Do not make every header element rounded.

---

# 10. Hero Section

## Headline

```text
Find Nearby Hospitals.

Get Real-Time Resource Availability.
```

The headline should be the strongest visual element on the page.

Use dark navy/slate text.

---

## Description

```text
MediTrack helps you quickly locate hospitals with verified emergency resources like ICU, ventilators, CT scans and more — when every second counts.
```

The paragraph should be readable and constrained in width.

Do not create an excessively wide paragraph.

---

## Decorative Callout

```text
Right hospital.
Right resources.
Faster care.
```

This can use a subtle handwritten/decorative type treatment.

It is decorative and must never compete with the main search experience.

---

# 11. Search Console

This is the primary interaction on the homepage.

It should visually appear as a prominent floating white container.

Background:

```text
#FFFFFF
```

Border:

```text
#E2E8F0
```

Use a subtle shadow.

Do not use excessive blur or glassmorphism.

---

## Fields

### Emergency Type

Icon:

Medical/emergency icon

Selected value:

```text
Accident / Trauma
```

---

### Required Resources

Icon:

Medical kit icon

Selected value:

```text
ICU, Ventilator, CT Scan
```

---

### Location

Icon:

Location pin

Label:

```text
Your Location
```

Secondary action:

```text
Use my location
```

The location action should have a GPS/crosshair icon.

---

### Search Button

Text:

```text
Search
```

Icon:

Search icon

Background:

```text
#0E4366
```

Text:

```text
#FFFFFF
```

The button should have strong visual prominence.

---

# 12. Emergency Presets

Presets:

```text
Accident / Trauma
Heart Emergency
Breathing Crisis
Burn Injury
```

The selected preset should use:

```text
background: #DCEBF5
color: #0E4366
```

Inactive presets should remain neutral.

Each preset should contain a small relevant medical icon.

Do not use oversized emoji.

Prefer a consistent icon library.

---

# 13. Feature Value Bar

Four horizontal feature items:

### Real-Time Availability

Icon:

Lightning

Description:

```text
See live resource status with freshness timestamps.
```

---

### Nearby Hospitals

Icon:

Location pin

Description:

```text
Find the closest verified hospitals in your area.
```

---

### Verified & Reliable

Icon:

Shield

Description:

```text
Only trusted hospitals with real-time data.
```

---

### Direct Contact

Icon:

Phone

Description:

```text
Get call details and directions instantly.
```

Icons should sit inside subtle light-blue circular containers.

Do not make the feature blocks look like four giant cards.

They should function as a horizontal value proposition section.

---

# 14. Hospital Results

## Header

Title:

```text
Nearby Hospitals
```

Subtitle:

```text
Showing hospitals near your location with available resources
```

Sort control:

```text
Sort by: Nearest
```

The sort control should remain visually secondary to the results.

---

# 15. Hospital Card

Each hospital result should use the same reusable component.

Structure:

```text
┌──────────────────────────────────────────────────┐
│ IMAGE │ Hospital Identity                        │
│       │ Name + Verified                          │
│       │ Distance                                 │
│       │ Address                                  │
│       │ Last updated                             │
│       │                                          │
│       │ Resource Status Grid                     │
│       │                                          │
│       │ Call Hospital       View Details →       │
└──────────────────────────────────────────────────┘
```

Cards should have:

```text
background: #FFFFFF
border: #E2E8F0
```

Use a subtle shadow only where necessary.

Avoid extremely rounded cards.

Use a restrained border radius consistently throughout the application.

---

# 16. Hospital Example Data

Use the following mock data during the UI development phase.

## City General Hospital

```text
Distance:
2.8 km away

Address:
MG Road, Kochi, Kerala

Last updated:
2 mins ago
```

Resources:

```text
Emergency Dept   Available
ICU              Available
Ventilator       Available
Blood            Available
CT Scan          Available
```

---

## Metro Medical Center

```text
Distance:
4.1 km away

Address:
NH Bypass, Kochi, Kerala

Last updated:
12 mins ago
```

Resources:

```text
Emergency Dept   Available
ICU              Available
CT Scan          Available
Blood            Available
Ventilator       Unavailable
```

---

## Saint Jude Medical Center

```text
Distance:
5.4 km away

Address:
Kaloor, Kochi, Kerala

Last updated:
28 mins ago
```

Resources:

```text
Emergency Dept   Available
ICU              Available
Ventilator       Available
Blood             Available
CT Scan           Unavailable
```

These are **UI demonstration values only**.

Do not represent them as actual live hospital information.

---

# 17. Hospital Verification

Verified hospitals may display a small checkmark indicator.

The indicator must remain visually secondary to the hospital name.

Do not make the verification badge oversized.

Future verification logic will come from the backend.

---

# 18. Resource Status Grid

Each resource should clearly communicate:

```text
Resource name
Status
```

Example:

```text
✓ ICU
Available
```

Available:

```text
#16A34A
```

Unavailable:

```text
#DC2626
```

The icon and text should both communicate the state.

Color must never be the only indicator.

---

# 19. Hospital Actions

## Call Hospital

Primary action.

Background:

```text
#1877A9
```

Icon:

Phone

Text:

```text
Call Hospital
```

---

## View Details

Secondary action.

Text:

```text
View Details →
```

It should not visually compete with the Call Hospital button.

---

# 20. Sidebar

The sidebar contains three widgets.

---

# 21. Emergency Widget

Heading:

```text
Emergency?
```

Description:

```text
Need immediate help? Call 108 or visit the nearest emergency department.
```

Icon:

EKG/pulse icon inside a dark circular container.

CTA:

```text
Emergency Contacts →
```

Dark background:

```text
#0B3553
```

Widget background:

```text
#E0EEF7
```

This widget should be visually prominent but not alarming.

---

# 22. Hospital Portal Widget

Heading:

```text
For Hospitals
```

Description:

```text
Access your dashboard, manage resources and connect IoT devices.
```

Action:

```text
Staff Login →
```

Use a professional hospital/medical staff image.

The image should support the content rather than dominate it.

Use an appropriate overlay if necessary to maintain text readability.

---

# 23. Motto Widget

Use:

```text
“
```

and:

```text
Better information.

Better decisions.

More lives saved.
```

Use a light blue surface.

Include a subtle pulse/heartbeat graphic as a decorative element.

The graphic must remain secondary to the typography.

---

# 24. Footer

Background:

```text
#0B3553
```

Text:

```text
#FFFFFF
```

Muted links:

Use a low-contrast but accessible light blue/gray.

Structure:

```text
MediTrack
Emergency Resources Platform

Home | Hospitals | About | Contact

© 2025 MediTrack. All rights reserved.
```

Maintain the same brand identity as the header.

---

# 25. Border Radius

Use a consistent radius system.

Suggested:

```text
Small controls: 8px
Cards: 12px
Large containers: 16px
Pills: 9999px
```

Do not use rounded corners on every element.

Buttons, badges, and cards should have deliberately different roles.

---

# 26. Shadows

Use shadows sparingly.

Preferred:

```text
Very subtle elevation
```

Avoid:

* Large floating shadows
* Neon shadows
* Multiple stacked shadows
* Excessive blur

The interface should primarily use:

```text
Spacing
Borders
Typography
Color
```

to establish hierarchy.

---

# 27. Icons

Use one consistent icon family throughout the application.

Required icon concepts:

* Medical cross
* User
* Search
* Location
* GPS
* Heart
* Lungs
* Flame
* Car crash/trauma
* Lightning
* Shield
* Phone
* Check
* Close
* Arrow
* EKG/pulse
* Medical kit

Do not mix multiple unrelated icon styles.

Do not use emoji as UI icons.

---

# 28. Interaction States

Every interactive component must have:

* Default
* Hover
* Focus
* Active
* Disabled

buttons must clearly communicate interaction.

Keyboard focus must remain visible.

---

# 29. Responsive Design

## Desktop

Use the two-column results layout:

```text
Hospital Results | Sidebar
```

---

## Tablet

Reduce spacing and allow the sidebar to move below the main results when necessary.

---

## Mobile

Use a single-column layout.

Recommended order:

```text
Header
Hero
Search
Emergency Presets
Feature Information
Hospital Results
Emergency Widget
Hospital Portal
Motto
Footer
```

Hospital cards should stack vertically.

Search fields should become full-width.

Buttons should remain easy to tap.

Do not simply shrink the desktop design.

The mobile layout should be intentionally composed.

---

# 30. Accessibility

Required:

* Semantic HTML
* Keyboard navigation
* Visible focus indicators
* Accessible form labels
* Sufficient contrast
* Touch-friendly controls
* Screen-reader-compatible status indicators
* Descriptive button labels
* Meaningful image alt text

Never communicate hospital resource availability using color alone.

---

# 31. Animation

Animation should be subtle and functional.

Allowed:

* Button hover transitions
* Small card hover elevation
* Dropdown transitions
* Search loading state
* Subtle page transitions

Avoid:

* Excessive floating animations
* Bouncing cards
* Constant pulsing
* Decorative motion everywhere
* Long entrance animations

Healthcare interfaces should feel stable and trustworthy.

---

# 32. Mock Data Rule

Real backend data is NOT being implemented during this design phase.

Use mock data through the architecture defined in `architecture.md`.

The UI must be designed so that mock data can later be replaced with:

```text
Supabase
API
Realtime services
IoT integrations
```

without changing the presentation components.

Never put mock data directly inside reusable UI components.

---

# 33. Content Accuracy Rule

Do not invent additional medical claims, clinical recommendations, or hospital capabilities.

The supplied content should be treated as product copy/mock data.

Where information is demonstrative, the implementation should keep it clearly separated from future real data.

---

# 34. Anti-Vibe-Coding Rules

The final result must NOT:

* Look like a generic AI dashboard.
* Use excessive rounded rectangles.
* Use random gradients.
* Use glassmorphism.
* Use arbitrary colors.
* Use excessive shadows.
* Use giant decorative icons.
* Use emoji as UI icons.
* Add unnecessary charts.
* Add unnecessary dashboards.
* Add random animations.
* Add unnecessary floating elements.
* Introduce unrelated components.
* Use inconsistent spacing.
* Use inconsistent border radii.
* Mix multiple design languages.
* Create unnecessary visual complexity.

The interface should feel deliberate, restrained, and professionally designed.

---

# 35. Implementation Priority

Implement in this order:

```text
1. Global design tokens
2. Typography
3. Header
4. Hero
5. Search Console
6. Emergency Presets
7. Feature Value Bar
8. Hospital Results
9. Hospital Card
10. Resource Status
11. Sidebar
12. Footer
13. Responsive behavior
14. Interaction states
15. Accessibility
16. Loading / Empty / Error states
17. Visual polish
```

Do not start with backend integration.

---

# 36. Definition of Visual Completion

The design is considered complete when:

* The UI matches this design specification.
* The visual hierarchy is immediately understandable.
* Search is the primary interaction.
* Hospital availability is easy to scan.
* Resource states are unambiguous.
* The interface works on mobile and desktop.
* Colors consistently use the defined design tokens.
* Typography is consistent.
* Spacing is consistent.
* Components are reusable.
* The design does not resemble a generic AI-generated dashboard.
* Mock data is cleanly separated from the UI.
* Future real data can be connected without redesigning the interface.