# Campus Roomies Visual & Design System

This document describes the visual language currently used across Campus Roomies. It reflects the patterns implemented in `src/app/globals.css`, `src/components/site-chrome.tsx`, and the landing page.

## 1. Design personality

Campus Roomies should feel:

- Warm, calm, and welcoming
- Trustworthy rather than overly commercial
- Student-focused and practical
- Friendly without feeling childish
- Spacious, readable, and low-pressure
- Human and community-oriented

Avoid excessive gradients, loud animations, dense dashboards, overly rounded app styling, unsupported claims, and competing accent colors. Campus Roomies remains an orange-led brand; the supporting colors should add calm and warmth without turning the product into a green brand.

The guiding idea is:

> Find compatible roommates and better housing near campus.

## 2. Color system

The palette should feel warm, calm, and lived-in. Orange provides energy and recognition, while muted sage and soft terracotta add belonging, reassurance, and depth.

### Brand palette

| Role | Color | Use |
|---|---|---|
| Campus orange | `#eb741b` | Primary actions, active states, links, brand emphasis |
| Warm cream | `#f8f3ec` | Page atmosphere, hero and large section backgrounds |
| Soft charcoal | `#292724` | Headlines, body text, navigation, strong contrast |
| Muted sage | `#91a58d` | Calm surfaces, compatibility indicators, process accents |
| Soft terracotta | `#ebc8ae` | Supporting illustration shapes and warm decorative surfaces |
| White / off-white | `#fffdfb` | Cards, forms, and surfaces requiring separation |

Use the colors in an intentionally uneven balance:

- Warm cream and white/off-white should carry most of the interface.
- Orange should remain the recognizable action and brand color.
- Charcoal should provide structure and readable contrast.
- Sage and terracotta should be restrained supporting accents, not competing action colors.

### Light mode

| Role | Color |
|---|---|
| Primary orange | `#eb741b` |
| Dark orange / hover | `#c85e0b` |
| Main text | `#292724` |
| Muted text | `#746e69` |
| Border / divider | `#e7e1db` |
| Page background | `#fffdfb` |
| Warm section background | `#f8f3ec` |
| Muted sage | `#91a58d` |
| Soft terracotta | `#ebc8ae` |
| Dark CTA background | `#292724` |
| CTA text | `#ffffff` |

### Dark mode

| Role | Color |
|---|---|
| Main text | `#f4eee9` |
| Muted text | `#b6aaa2` |
| Border / divider | `#403a35` |
| Page background | `#1d1a18` |
| Warm section background | `#28231f` |
| Muted sage | `#79bb91` |
| Soft terracotta | `#9f7258` |
| Orange hover | `#f29345` |
| Dark surface | `#24201d` |
| CTA background | `#11100f` |

Orange is reserved for primary actions, emphasis, links, and important highlights. Sage is used through surfaces, process accents, preference or compatibility indicators, and calm informational states rather than green buttons. Terracotta is used sparingly in illustrations and decorative surfaces. Warm cream separates sections and creates subtle surfaces. Muted text is used for metadata and supporting information.

### Semantic colors

Semantic colors must remain distinct from the brand palette and meet contrast requirements in their actual context:

| Meaning | Preferred treatment |
|---|---|
| Available / success | Muted sage surface or text with sufficient contrast |
| Warning / attention | Muted amber |
| Error / unavailable | Muted brick red |
| Information | Dusty blue-gray used sparingly |
| Disabled | Warm gray with reduced emphasis |

Use pale sage, terracotta, and blue-gray as backgrounds when contrast is insufficient for small text. Do not use light accent colors directly as body text or button labels.

## 3. Typography

The primary typeface is Inter with system fallbacks:

```css
font-family: var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif;
```

Use a clear hierarchy:

- Large, expressive hero heading
- Confident but restrained page headings
- Conversational section headings
- Readable body copy
- Small but accessible metadata
- Bold, action-oriented buttons

Use sentence case for interface copy. Uppercase is reserved for small eyebrow labels where appropriate.

## 4. Layout and spacing

The main content uses a centered shell:

```css
width: min(1280px, calc(100% - 48px));
margin-inline: auto;
```

Use a calm spacing rhythm:

- Small: `8px`
- Compact: `12px`
- Standard: `16px`
- Medium: `24px`
- Large: `32px`
- Section spacing: `56px–72px`

Group related information tightly and separate unrelated sections clearly.

## 5. Cards, radius, and elevation

Cards should use consistent heights in grids, keep actions anchored at the bottom, and avoid unnecessary nested containers. Prefer borders and background contrast over heavy shadows.

Recommended radius values:

- Small controls: `7px`
- Buttons and cards: `10px–12px`
- Avatars: circular
- Tags and pills: fully rounded

Use shadows sparingly for sticky headers, menus, floating controls, and hovered primary buttons.

## 6. Buttons and actions

### Primary button

Use an orange background, white text, bold label, rounded corners, and a subtle upward hover movement.

Examples:

- `Explore rooms`
- `List a room`
- `Create your profile`

### Secondary button

Use a transparent background, border, ink-colored text, and a warm background on hover.

### Quiet action

Use a warm background, orange text, and smaller padding for supporting card actions.

| Context | Preferred action |
|---|---|
| Room listing | `View room` |
| Room-needed profile | `View profile` |
| Browse page | `Explore rooms` |
| Room provider | `List your room` |
| Room seeker | `Create your profile` |

## 7. Header and navigation

The header is sticky, approximately `78px` tall, and separated with a subtle bottom border. It becomes slightly more elevated after scrolling.

Keep navigation simple:

- Find roommates
- How it works
- List a room
- Account access
- Theme toggle

The full Campus Roomies wordmark is shown on mobile. Use the standalone mark only when space or decoration requires it.

## 8. Hero design

The hero should communicate the product immediately:

> Find a roommate who fits your life

The preferred structure is:

1. Clear headline
2. Short supporting statement
3. Two role-based actions
4. Decorative brand visual
5. No unnecessary search form when discovery already exists below

The two role cards represent the primary user journeys:

- **Need a roommate?** — `List your room`
- **Looking for a place?** — `Create your profile`

Keep the hero copy and role actions centered on the landing page. Use a single-color orange emphasis rather than a gradient in the headline. Cards can communicate clickability through subtle illustration movement, border or background changes, arrow movement, and small elevation. On mobile, illustrations must have enough separation to avoid visual collisions.

## 9. Listing cards

Listing cards should follow this structure:

1. Fixed-height image
2. Availability label
3. Save button
4. Room type and distance
5. Two-line title area
6. Pricing area
7. Location
8. Feature tags
9. Owner and action row

Images, titles, pricing areas, and tags should reserve predictable space so neighboring cards remain aligned.

### Room listing pricing

The frontend assumes two people share the stored total rent:

```text
₦100,000 / year     Split 2 ways
Total rent: ₦200,000 / year
```

The individual share is the primary number. Total rent is supporting information. Use a compact split pill and a subtle orange left accent instead of a large tinted pricing container. Keep the pricing block to two lines.

### Room-needed pricing

Room-needed listings do not show split pricing. They display the total target budget:

```text
₦300,000 / year
```

## 10. Tags and metadata

Tags should be compact, warm, neutral, and easy to scan. They should be less prominent than the title and price.

Location, distance, and room type should use muted text and small meaningful icons. Icons should clarify information rather than decorate every element.

## 11. Motion

Motion should make the interface feel alive without becoming distracting.

Use:

- Scroll reveals with opacity and slight upward movement
- Staggered card and process-step entrances
- Hover movement on hero illustrations
- Small button lifts
- Arrow movement on interactive links
- Sticky-header transitions
- Smooth scrolling

Keep movement subtle and short. Avoid constant looping motion and respect reduced-motion preferences. The existing `Reveal` component is the preferred mechanism for scroll-based entrance animation.

## 12. Dark mode

Dark mode should feel like a warm evening version of the same product, not a pure-black redesign.

Use warm charcoal backgrounds, cream text, muted beige secondary text, lighter dark card surfaces, and restrained orange accents. Avoid pure white cards, pure black backgrounds, low-contrast gray text, and large bright-orange surfaces.

Every new component should receive an intentional dark-mode treatment.

## 13. Responsive behavior

### Desktop

- Use two-column and multi-column layouts where useful.
- Preserve generous whitespace.
- Balance hero copy and visual content.
- Display full navigation.

### Tablet

- Reduce grid columns when necessary.
- Preserve card alignment.
- Keep actions accessible without crowding.

### Mobile

- Stack major sections vertically.
- Keep the full wordmark visible.
- Use comfortable touch targets.
- Preserve generous spacing between hero cards.
- Allow hero copy to wrap naturally.
- Keep cards readable in one column.
- Prevent decorative illustrations from interfering with content.

## 14. Accessibility

- Maintain visible focus states.
- Use semantic buttons and links.
- Provide meaningful alt text for informative images.
- Use empty alt text for decorative illustrations.
- Preserve sufficient contrast in both themes.
- Support keyboard navigation.
- Respect reduced-motion preferences.
- Announce loading and error states appropriately.
- Do not communicate important information through color alone.

## 15. Content voice

The voice should be clear, reassuring, direct, human, practical, and non-judgmental.

Prefer:

> Find somewhere that feels right.

Avoid:

> Unlock the ultimate roommate experience.

Prefer:

> See the price, the living rhythm, and the details that shape daily life.

Avoid exaggerated marketplace or technology language.

## 16. Design decision summary

The core system is:

> Warm neutrals + orange actions + generous spacing + clear hierarchy + subtle motion + human copy.

The most important hierarchy is:

1. What the user needs to understand first
2. What action they can take next
3. What supporting details help them decide

For listings:

1. Room or profile identity
2. Personal cost or budget
3. Location and living details
4. Owner or profile context
5. Action button
