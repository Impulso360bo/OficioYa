# Design Brief

## Purpose
Spanish-language job marketplace for trades workers (albañil, carpintero, pintor, electricista, plomero). Direct, trustworthy, approachable interface that makes job discovery and filtering intuitive and fast.

## Tone & Differentiation
Modern utilitarian-with-warmth. Warm orange primary conveys energy and approachability; slate secondary builds trust and professionalism. Not generic SaaS blue. Think Mercado Libre clarity + Airbnb accessibility.

## Color Palette (Light / Dark)

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| **Primary** | `0.62 0.22 48` (warm orange) | `0.72 0.2 48` | Action buttons, call-to-action, search focus |
| **Secondary** | `0.45 0.05 257` (slate) | `0.65 0.04 257` | Context, secondary actions, stability |
| **Accent** | `0.55 0.18 165` (emerald) | `0.65 0.16 165` | Success, job skill badges, highlights |
| **Destructive** | `0.55 0.22 25` | `0.65 0.19 22` | Warnings, cancellation |
| **Muted** | `0.93 0.02 260` | `0.25 0.02 260` | Secondary text, disabled states |
| **Background** | `0.98 0 0` | `0.12 0 0` | Page background |
| **Card** | `1.0 0 0` | `0.16 0 0` | Job cards, popover surfaces |
| **Border** | `0.92 0.01 260` | `0.22 0.02 260` | Dividers, card edges |

## Typography
- **Display**: Bricolage Grotesque (distinctive, playful-professional, headlines)
- **Body**: DM Sans (clean, modern, highly readable, default copy)
- **Mono**: Geist Mono (codes, salaries, technical details)
- **Scale**: 12px (micro), 14px (body), 16px (body-lg), 20px (subtitle), 32px (heading)

## Shape Language
- **Radius**: 12px default (`rounded-lg`), 8px cards (`rounded-md`), 0 for technical elements
- **Shadows**: Subtle `shadow-sm` for cards at rest, `shadow-md` on hover
- **Spacing**: 16px base unit (p-4), 24px sections (p-6), 8px micro-interactions

## Structural Zones

| Zone | Treatment | Purpose |
|------|-----------|---------|
| **Header** | `bg-card` with `border-b` in muted color. Search bar with orange focus ring. Logo/title in display font. | Navigation, quick search, branding anchor |
| **Sidebar (Filters)** | `bg-muted/20` with `border-r`. Category checkboxes with primary color accent. Location input. | Job discovery path, filtering |
| **Main Content** | `bg-background`. Grid of job cards (2 cols mobile, 3 cols tablet, 4 cols desktop). Cards have left 4px border in primary, no top border gutter. | Job listings, main focus |
| **Footer** | `bg-muted/15` with `border-t`. Small secondary text. | Legal, links, meta |

## Component Patterns
- **Job Card**: Left-border accent in primary (4px). Title in body font bold. Category badge with emerald bg + dark text. Location pin icon + text. Salary range in mono, right-aligned. Hover lifts shadow, border brightens.
- **Button (Primary)**: Warm orange bg, white text, moderate radius. Hover lightens. Active darkens.
- **Input**: Light border, orange focus ring, rounded. Placeholder in muted.
- **Filter Checkbox**: Slate primary, emerald checked state. No heavy styling.
- **Badge**: Emerald bg for skill/category. Muted bg for secondary info.

## Motion
- **Transition Default**: 0.3s cubic-bezier(0.4, 0, 0.2, 1) on all interactive elements
- **Card Hover**: Shadow lift, left-border color boost
- **Search Focus**: Ring expands, text color shifts to primary
- **No entrance animations**: Load instantly, prefer progressive enhancement

## Light vs. Dark Mode
Both modes fully supported. Dark mode maintains warm orange (slightly brightened to `0.72`) and translates slate to light slate for contrast. Card backgrounds darken to near-black (`0.16`). Border color shifts from pale to dark slate. All contrast levels maintained at AA+ in both modes.

## Constraints
- No purple gradients. No generic blue. No rainbow palettes.
- No full-page gradients; use layered surfaces instead.
- Moderate rounded corners (no 0 for cards, no 999px except where intentional).
- One font family for display (Bricolage), one for body (DM Sans).
- Spanish labels throughout (Buscar Trabajos, Categorías, Ubicación, Salario, Detalles del Trabajo).

## Signature Detail
Left-border accent on job cards in warm orange. Instantly recognizable, adds movement and depth to a card grid without overdecorating. Communicates "this is actionable" at a glance.

## Registration & Profile Extensions

### Role Selection
Dual-path UI with role cards (Trabajador / Cliente). Active role card has primary border + light primary background. Cards respond to hover with shadow lift.

### Role Badges
Two variants: Trabajador (emerald/20 bg + emerald text), Cliente (slate/20 bg + slate text). Placed in header after login and on profile page.

### Form Elements
- **Labels**: 14px, semibold, medium spacing above
- **Inputs**: Primary focus ring (2px), 8px padding, muted placeholder
- **Select (Bolivia Cities)**: Native HTML select with primary focus ring styling
- **Button (Submit)**: Primary orange, white text, full width on mobile, auto width on desktop

### Profile Card
Left-border accent in emerald (4px), distinguishing it from job cards. Editable sections with inline edit buttons. Avatar placeholder on desktop, stacked on mobile.

### Cities Dropdown
Full list of Bolivia cities (La Paz, Cochabamba, Santa Cruz, etc.) rendered as native select. No custom dropdown UI — leverage browser defaults for accessibility.

## Commission System Extensions

### Balance Panel
Left-border accent panel on worker profile. Color-coded: emerald for positive balance, orange for warning (-50 to -99 Bs), red for suspended (≤ -100 Bs). Displays current balance, commission rate (20%), and suspension threshold in mono font. Stats laid out as grid with centered labels below values.

### Suspension Alert Banner
Destructive-colored banner (bg-destructive/15, border destructive/30). Bold title "Tu perfil está suspendido" + explanatory text linking balance recovery to reactivation. Appears above balance panel when suspended. Dismissed via icon or hidden on scroll.

### QR Top-Up Card
Card-based section with title "Cargar Saldo", QR placeholder (dashed border, muted background), instructions in secondary font (14px), and "Ir a Pago" button (primary orange). Designed for user to upload QR code or scan with phone.

### Job Status Badges
Four states: Posted (gray/muted), InProgress (orange/primary), PendingApproval (red/destructive), Completed (emerald/accent). Badges are pill-shaped, 12px font, displayed top-right of job card or detail.

### Job Action Buttons
Worker: "Marcar como Finalizado" (primary orange, full width on mobile). Client: "Aprobar Trabajo" (secondary slate, 20% opacity, border). Buttons appear in action-button-row layout with 12px gap. Disabled state in muted/40.

### Commission Display
Small stat blocks (3-column grid on desktop, stacked on mobile) showing: Balance (mono, warning color), Commission Rate (emerald, 20%), Threshold (destructive, -100). Each block has bg-muted/10, centered value + label below.

## Color Overrides for Commission
- **Warning**: Use primary (orange) for -50 to -99 Bs balance state
- **Suspended**: Use destructive (red) for ≤ -100 Bs and alerts
