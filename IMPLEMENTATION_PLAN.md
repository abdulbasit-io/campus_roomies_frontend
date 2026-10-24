# Campus Roomies Frontend Implementation Plan

## 1. Frontend responsibility

The frontend provides a responsive, accessible, design-consistent experience over the backend contracts. It may improve usability with client validation and optimistic presentation where safe, but it must never be treated as the source of truth for authorization or business rules.

The frontend follows [MASTER_IMPLEMENTATION_PLAN.md](../MASTER_IMPLEMENTATION_PLAN.md).

## 2. Target stack

- Next.js with React and TypeScript.
- Tailwind CSS with shared design tokens.
- Server rendering for public listing pages where useful.
- React Hook Form and Zod for complex forms where useful.
- Native `fetch` initially.
- Add TanStack Query only when server-state caching/invalidation becomes materially difficult without it.
- Avoid Redux and large component libraries unless a concrete requirement justifies them.

## 3. Design-system reconstruction

Start by converting the Stitch export into reusable implementation primitives rather than copying screens independently.

### Tokens

- Campus Orange `#E87516`.
- Warm neutral surfaces.
- Primary ink around `#1C1917`.
- Inter typography.
- 8px spacing rhythm.
- 8px, 12px, and 16px radius levels.
- Consistent border, focus, error, success, disabled, and selected states.
- Light/dark semantic tokens rather than hardcoded screen-specific colors.

### Shared components

- App shell and responsive navigation.
- Buttons and icon buttons.
- Text, password, number, search, and textarea inputs.
- Institution and area selectors.
- Listing cards and listing detail sections.
- Profile summary and preference-tag components.
- Filter chips and mobile filter sheet.
- Progress stepper.
- Photo uploader and preview grid.
- Dialog, confirmation modal, and toast/alert.
- Empty, loading, error, Found, Restricted, and unavailable states.
- WhatsApp handoff panel.

Remove or rewrite unsupported visual claims:

- Verification badges without a real verification state.
- Compatibility percentages.
- Internal chat affordances.
- Payment or transaction language.
- Guaranteed safety/authenticity claims.

## 4. Application structure

Organize routes and components around product domains, not screenshot filenames. The exact route names can be finalized during scaffolding, but the frontend should provide:

- Marketing/home.
- Public discovery.
- Listing detail.
- Authentication.
- Profile completion.
- Listing creation and draft flow.
- Owner listing management.
- Seeker profile/listing flow.
- Interest list.
- Report flow.
- General product feedback flow for guests and signed-in users, separate from
  safety reporting, with an administrator feedback inbox.
- Admin catalog-management experience, as a backend recommendation below.
- Admin moderation report queue and report-review workflow.

### Admin catalog management

The backend recommended a dedicated, role-protected admin area for maintaining
the controlled institution and area catalog. The initial admin dashboard,
catalog management and audit views are implemented under `src/app/admin`.

Routes and pages:

- `/admin`: operations dashboard with institution/area totals, open report
  count, recent catalog changes, and privileged-workflow shortcuts.
- `/admin/moderation`: paginated open-report queue, ordered oldest first.
- `/admin/moderation/reports/[reportId]`: report detail, listing context,
  audited restrict/restore/found actions, and report resolution.
- `/admin/moderation/audit`: paginated decisions and their administrator notes.
- `/admin/communications`: queue one-off operational email messages.
- `/admin/institutions`: searchable list showing abbreviation,
  active/archived state, area count, and create/edit/archive/restore actions.
- `/admin/institutions/new`: institution creation form.
- `/admin/institutions/[institutionId]`: institution edit/details and link to
  area management.
- `/admin/institutions/[institutionId]/areas`: add, rename, archive, and
  restore areas for the selected institution.
- `/admin/audit`: paginated catalog-change history with actor, action, affected
  record, and timestamp.

Frontend behavior should align with the backend contract:

- Require an authenticated `ADMIN` role; hiding navigation is not
  authorization.
- Keep all admin routes out of public navigation; redirect ordinary signed-in
  users away from the admin suite and enforce authorization on every API.
- Use the standard sign-in flow with a private return target rather than a
  publicly linked administrator login page.
- Require an administrator decision note for moderation actions and preserve
  separate listing actions from report resolution.
- Use CSRF-protected mutations and surface server validation/conflict errors.
- Explain that archival preserves existing references while removing catalog
  records from public institution and area selectors.
- Allow admins to include archived entries when reviewing and restoring them.
- Validate and exercise the admin flows against a seeded administrator account
  and the PostgreSQL-backed API.
- WhatsApp handoff.
- Administrator interfaces remain separate from the public product navigation.

Keep domain forms and view models typed against the shared API contract. Avoid duplicating backend enums or silently inventing client-only values.

## 5. Navigation and state behavior

- Public home and discovery are reachable without sign-in.
- Authentication preserves the intended listing/contact action and returns the user to the correct context.
- Back navigation preserves discovery filters and reasonable scroll/context where practical.
- Found and Restricted listings cannot present Active contact actions.
- Contact flow clearly states that the conversation moves to WhatsApp.
- No screen should resemble an internal chat inbox.
- Theme defaults to device preference with a user override.
- Loading prevents duplicate submissions.
- Failed mutations preserve entered form data and explain recovery.
- Unsaved-change warnings appear when leaving a dirty multi-step form.

## 6. Feature sequence

### Foundation

- Scaffold Next.js and TypeScript.
- Configure Tailwind tokens and dark mode.
- Add linting, formatting, type checking, test runner, and browser test setup.
- Add environment configuration for API origins.
- Add typed API client/fetch helpers.
- Add session bootstrap and error normalization.

### Anonymous discovery

- Home page and institution selector.
- Browse page with 12-item pagination.
- Institution, area, listing-type, budget, price-period, and supported preference filters.
- Search by supported area/neighbourhood/landmark data.
- Listing cards and public details.
- Loading, empty, no-match, error, Found, and Restricted states.
- Desktop and mobile responsive variants.

### Authentication and profile

- Registration with first name, last name, email, password, gender.
- Login/logout/session state.
- Password reset screens.
- Profile completion for WhatsApp number, institution, department, level, and About Me.
- Format validation and explicit phone confirmation.
- Profile photo upload and preview; required before creating any listing.
- Use the profile photo as the poster image for room-needed listings.
- Accessible form errors and focus management.

### Contact and interests

- Automatically record interest before authorized WhatsApp handoff; block
  handoff and offer retry if registration fails.
- Persistent, idempotent interest registration and withdrawal.
- Owner interest list with public seeker summary, tags, and timestamp.
- Show active listing interests in the owner's My Listings view.
- Protected contact eligibility check.
- WhatsApp handoff screen and external navigation for both room-available and room-needed listing creators.
- Ineligible state with clear profile-completion action.

### Room-holder listing flow

- Intent selection with only the two approved intents.
- Listing details:
  - Title.
  - Institution.
  - Curated area.
  - Optional landmark.
  - Accommodation type.
  - Other accommodation type with a required description.
  - Price amount and period.
  - Availability.
  - Description.
- Preference step with one required selection in every approved group.
- Photo upload with minimum 3 and maximum 4 photos, matching the four-image
  listing gallery. Listing photos retry briefly on load failures, and the
  details gallery opens images in a full-size viewer.
- Draft autosave/resume.
- Review screen showing actual entered data.
- Publish success only after backend confirmation.
- Owner management and Mark as Found confirmation.

### Room-seeker flow

- Target budget.
- Target neighbourhood.
- Roommate gender.
- Study atmosphere/quiet hours.
- Utility/power expectations.
- Daily lifestyle traits.
- About field with 300-character limit.
- Public seeker preview.
- Present seeker move-in timing as a search requirement, not room availability.
- Publish/complete flow without forcing the room-holder path.

### Reporting and moderation

- Auth-gated report entry point.
- Fixed report reasons.
- Optional explanatory text only if supported by the API contract.
- Submitted confirmation.
- Restricted/unavailable listing state.
- Admin-only moderation UI if moderation is handled through the product at launch.

## 7. Responsive requirements

Validate critical screens at:

- 320px.
- 360px.
- 390px.
- 768px.
- 1024px.
- 1280px.
- 1440px.

Specifically test:

- Long institution names.
- Long listing titles.
- Large naira amounts.
- Empty and failed image states.
- Open selectors and mobile sheets.
- Validation messages.
- Dialogs near viewport edges.
- Mobile keyboard and safe-area behavior.
- Sticky actions that do not cover fields or content.

## 8. Accessibility requirements

- Semantic landmarks and headings.
- Labels and accessible names for all controls.
- Keyboard-accessible selectors, dialogs, sheets, and menus.
- Visible focus indicators.
- Logical focus order.
- Focus trap and restoration for dialogs.
- Error summary or field-level association for failed forms.
- Status communicated with text and icon, not color alone.
- Practical touch targets near 44x44px.
- Respect reduced-motion preferences.

## 9. Frontend testing plan

### Component tests

- Buttons and form states.
- Selectors and filter chips.
- Listing cards and status variants.
- Photo uploader constraints.
- Preference selection completeness.
- Dialog focus behavior.

### Integration tests

- Auth state and return-to-context behavior.
- Discovery filters/pagination.
- Draft autosave/resume.
- Listing form validation by intent.
- Contact eligibility rendering.
- Interest creation/withdrawal.
- Report submission.

### Browser end-to-end tests

- Anonymous home to listing detail.
- Filter and pagination behavior.
- Register/login/logout.
- Complete profile.
- Save and resume draft.
- Publish room-holder listing.
- Publish seeker listing.
- Mark listing Found.
- Express interest and continue to WhatsApp.
- Report listing.
- Restricted/Found unavailable states.

### Visual/UX checks

- Compare major screens with the Stitch references while prioritizing the normalized design system.
- Confirm no clipped text, overlapping controls, unsupported claims, inconsistent terminology, or fake chat/payment/verification affordances.

## 10. Frontend completion gates

- Strict type checking, linting, component tests, integration tests, and browser tests pass.
- All protected actions handle unauthenticated and incomplete-profile states.
- Public pages contain no private contact data.
- Design tokens are reused across desktop/mobile/light/dark states.
- Critical flows are usable at all required viewport sizes.
- Loading, empty, error, success, disabled, selected, Found, Restricted, and unsaved states are covered.
- External WhatsApp handoff is clearly distinguished from in-app messaging.

## 11. Current API integration status

The frontend now uses the backend API for cookie-session bootstrap, registration,
login/logout, password reset, profile completion, institution and area catalogs,
public discovery and listing details, owner listing management, reports, interest
actions, contact authorization, and admin catalog workflows. Listing forms save
and resume backend drafts, room-holder photos use the backend-authorized
Cloudinary flow, and both listing intents can submit a backend publication
request. Backend validation remains authoritative; failed requests keep the form
open and display the API error.

Known scope boundaries:

- Saved listing IDs are browser-local for both authenticated and anonymous
  users. They do not require sign-in and are not shared across browsers or
  devices because the backend does not expose a saved-listings API.
- Draft persistence is explicit through the Save draft action; it is not
  autosaved while typing.
- Cloudinary uploads require the backend provider credentials to be configured.
- Vitest covers API helpers and frontend mapping/redirect behavior; component
  integration and browser end-to-end coverage remain to be added before treating
  the frontend completion gates above as satisfied.
- Full flow validation still requires a running API, a seeded account with a
  complete profile, active institution/area catalog records, and configured
  email/Cloudinary providers for the respective flows.
