---
version: alpha
name: shadcn-admin-design-system
description: A clean, modular, and highly functional dashboard admin interface based on React 19, Vite, Tailwind CSS v4, and Radix UI primitives. The layout features three sidebar styles (Inset, Floating, standard Sidebar), three collapsible sidebar widths (Default, Compact/Icon, Offcanvas/Full), and LTR/RTL support. The design uses OKLCH color spaces mapped to standard Hex colors for light and dark modes, clean sans-serif typography, and standard card and form structures.

colors:
  background: "#ffffff"
  foreground: "#020618"
  card: "#ffffff"
  card-foreground: "#020618"
  popover: "#ffffff"
  popover-foreground: "#020618"
  primary: "#0f172b"
  primary-foreground: "#f8fafc"
  secondary: "#f1f5f9"
  secondary-foreground: "#0f172b"
  muted: "#f1f5f9"
  muted-foreground: "#62748e"
  accent: "#f1f5f9"
  accent-foreground: "#0f172b"
  destructive: "#e7000b"
  border: "#e2e8f0"
  input: "#e2e8f0"
  ring: "#90a1b9"
  chart-1: "#f54900"
  chart-2: "#009689"
  chart-3: "#104e64"
  chart-4: "#ffb900"
  chart-5: "#fe9a00"

typography:
  display-xxl:
    fontFamily: "'Manrope', 'Inter', sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.96px
  display-xl:
    fontFamily: "'Manrope', 'Inter', sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.64px
  display-lg:
    fontFamily: "'Manrope', 'Inter', sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.22px
  body-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0px
  caption:
    fontFamily: "'Inter', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0px

rounded:
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  pill: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px

components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
---

## Overview

The `shadcn-admin` design system is optimized for data-dense, highly interactive enterprise applications. Rather than using fixed dimensions and absolute color maps, the design focuses on **semantic themes** and **flexible canvas layouts**. It supports complete real-time adaptation for theme preference (system, light, dark), sidebars (inset, floating, standard sidebar), layouts (default expanded, compact/icon, offcanvas/hidden), and text orientation (left-to-right LTR, right-to-left RTL).

The interface is structured in a two-tier layout:
1. **The Navigation Shell**: Anchored by a collapsible sidebar (using Radix-based custom triggers) and a sticky, profile-aware top navigation header.
2. **The Content Area**: A scrollable canvas hosting structured metric grids, responsive chart cards, command palettes, and tables built on Radix primitives.

---

## Colors

The application relies entirely on modern CSS variables mapped through OKLCH color channels. This provides mathematically smooth shifts in lightness and color temperature when transitioning between light and dark modes.

### Theme Tokens (Light Mode vs. Dark Mode)

| Token | Light Mode Color | Dark Mode Color | UI Purpose |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.129 0.042 264.695)` | Root page background canvas |
| `--foreground` | `oklch(0.129 0.042 264.695)` | `oklch(0.984 0.003 247.858)` | Dominant body text and labels |
| `--card` | `oklch(1 0 0)` | `oklch(0.14 0.04 259.21)` | Card component container background |
| `--card-foreground` | `oklch(0.129 0.042 264.695)` | `oklch(0.984 0.003 247.858)` | Card headings, descriptions, and labels |
| `--popover` | `oklch(1 0 0)` | `oklch(0.208 0.042 265.755)` | Hover tooltips, dropdowns, and select lists |
| `--popover-foreground` | `oklch(0.129 0.042 264.695)` | `oklch(0.984 0.003 247.858)` | Context/hover dropdown item labels |
| `--primary` | `oklch(0.208 0.042 265.755)` | `oklch(0.929 0.013 255.508)` | High-contrast focus actions, buttons, and badges |
| `--primary-foreground` | `oklch(0.984 0.003 247.858)` | `oklch(0.208 0.042 265.755)` | Text rendering inside primary buttons/badges |
| `--secondary` | `oklch(0.968 0.007 247.896)` | `oklch(0.279 0.041 260.031)` | Subdued background action buttons |
| `--secondary-foreground` | `oklch(0.208 0.042 265.755)` | `oklch(0.984 0.003 247.858)` | Secondary action label text |
| `--muted` | `oklch(0.968 0.007 247.896)` | `oklch(0.279 0.041 260.031)` | Table headers, inactive navigation states |
| `--muted-foreground` | `oklch(0.554 0.046 257.417)` | `oklch(0.704 0.04 256.788)` | Secondary descriptions, timestamps, help text |
| `--accent` | `oklch(0.968 0.007 247.896)` | `oklch(0.279 0.041 260.031)` | Hover backgrounds for rows/items |
| `--accent-foreground` | `oklch(0.208 0.042 265.755)` | `oklch(0.984 0.003 247.858)` | Text rendering inside hovered rows/items |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error boundaries, delete modals, alert messages |
| `--border` | `oklch(0.929 0.013 255.508)` | `oklch(1 0 0 / 10%)` | Thin structural guidelines and card borders |
| `--input` | `oklch(0.929 0.013 255.508)` | `oklch(1 0 0 / 15%)` | Form borders, checkboxes, and input frames |
| `--ring` | `oklch(0.704 0.04 256.788)` | `oklch(0.551 0.027 264.364)` | Focus-visible halo and active interactive states |

### Chart & Analytics Palette

The dashboard uses a 5-step semantic chart colors palette for data visualization (bar/line charts, maps, and reports):
- **Chart 1 (Orange)**: `oklch(0.646 0.222 41.116)` / Dark: `oklch(0.488 0.243 264.376)`
- **Chart 2 (Teal)**: `oklch(0.6 0.118 184.704)` / Dark: `oklch(0.696 0.17 162.48)`
- **Chart 3 (Blue)**: `oklch(0.398 0.07 227.392)` / Dark: `oklch(0.769 0.188 70.08)`
- **Chart 4 (Yellow)**: `oklch(0.828 0.189 84.429)` / Dark: `oklch(0.627 0.265 303.9)`
- **Chart 5 (Coral)**: `oklch(0.769 0.188 70.08)` / Dark: `oklch(0.645 0.246 16.439)`

---

## Typography

The font family pairs **Inter** (for primary numeric data, data tables, and generic UI labels) and **Manrope** (for content readability and titles).
Global font features enable standard modern spacing.

### Typographic Rhythm

- **Font Families**:
  - `var(--font-inter)`: `'Inter', 'sans-serif'`
  - `var(--font-manrope)`: `'Manrope', 'sans-serif'`
- **Headings (`h1`, `h2`, `h3`)**: Rendered in `--font-manrope` with medium to bold weights and a slightly negative letter-spacing for dense editorial titles.
  - Page titles (`h1`): `text-2xl font-bold tracking-tight`
  - Card titles: `font-semibold leading-none`
- **Body & Captions**: Rendered in `--font-inter`.
  - Body default: `text-sm font-medium`
  - Help details & Secondary elements: `text-xs text-muted-foreground`
- **Input zoom avoidance**: Standard inputs enforce a minimum size of `16px` on viewport widths under `768px` to bypass iOS browser zoom lockouts.

---

## Layout & Structure

The dashboard grid automatically handles content distribution across different viewing formats:

### Layout Configurations (Settings Panel)

Using the **Theme Settings Drawer** (`ConfigDrawer`), users can modify layout components in real-time:
- **Sidebar Styles**:
  - **Inset (`inset`)**: Floating canvas background surrounded by sidebar margins; body adopts `bg-sidebar` styling.
  - **Floating (`floating`)**: Sidebar detaches from sides, casting a floating depth.
  - **Sidebar (`sidebar`)**: Traditional edge-to-edge layout where the sidebar and top navbar split screen coordinates cleanly.
- **Layout Width Modes**:
  - **Default**: Full width sidebar containing navigation labels and action triggers.
  - **Compact / Icon**: Sidebar collapses into a narrow icon bar (`width: 3.5rem`), maximizing visual space for tables and charts.
  - **Offcanvas / Full**: Sidebar hides offscreen entirely, visible only when toggled manually.
- **Text Direction**:
  - **LTR**: Classic left-to-right text reading.
  - **RTL**: Complete right-to-left layout inversion for Persian/Arabic translations.

---

## Elevation & Depth

- **Flat/Zero Level**: Standard pages and input boxes rest flush.
- **Card Depth (`shadow-sm`)**: Thin borders (`border-border`) paired with a minimal shadow.
- **Overlay/Floating Depth (`shadow-2xl` / popover)**: Multi-layer depth mapping applied to context dropdowns, selects, and drawers to focus attention.
- **Focus Rings (`focus-visible`)**: Focus indicator uses outline-ring borders with a `3px` light blue/indigo alpha halo (`focus-visible:ring-ring/50`) instead of default browser focus rings.

---

## Shapes & Radius

The system implements a single base configuration parameter (`--radius: 0.625rem`) that scales linearly:
- **Small Corners (`sm`)**: `calc(var(--radius) - 4px)` (~6px) - Checkboxes, tag badges, small buttons.
- **Medium Corners (`md`)**: `calc(var(--radius) - 2px)` (~8px) - Inputs, buttons, small menus.
- **Large Corners (`lg`)**: `var(--radius)` (10px) - Pricing modules, chart frames, dashboard main grid.
- **Extra Large Corners (`xl`)**: `calc(var(--radius) + 4px)` (~14px) - Modals, drawers, and overlay shells.

---

## Components

### 1. Button (`src/components/ui/button.tsx`)
A multipurpose trigger component configured through Class Variance Authority (`cva`):
* **Default**: High contrast primary action button (`bg-primary text-primary-foreground`).
* **Destructive**: Alert actions indicating deletions or fatal states (`bg-destructive text-white`).
* **Outline**: Traditional secondary border layout. Swaps backgrounds on dark mode (`bg-input/30 dark:border-input`).
* **Ghost**: Frameless button triggers, ideal for header icons and list modifiers.
* **Link**: Primary text colored button with underline hover behavior.

### 2. Card (`src/components/ui/card.tsx`)
The standard unit of layout distribution. Consists of:
* **CardHeader**: Container for title, description, and actions.
* **CardTitle**: Semibold heading that frames the content block.
* **CardDescription**: Grayed caption detail.
* **CardContent**: The main component area, holding tables, statistics, or charts.
* **CardFooter**: Action pins located at the bottom.

### 3. Scroll Area (`src/components/ui/scroll-area.tsx`)
Replaces default scrollbars with custom interactive bars (`scrollbar-width: thin` fallback, styled handle inside WebKit layouts).

---

## Do's and Don'ts

### Do:
- **Do use OKLCH color models** when creating new interface colors to ensure compatibility with dark/light themes.
- **Do verify interactive focus outlines** (`focus-visible:ring-ring/50`). Focus states must always be visible for accessibility compliance.
- **Do keep form controls accessible** on mobile devices by ensuring the minimum text font-size is at least `16px`.
- **Do respect RTL layout context** when positioning dropdowns, sidebars, and grid elements.

### Don't:
- **Don't hardcode absolute colors** (e.g. `bg-white` or `bg-slate-900`) inside components. Use semantic mappings like `bg-background` and `text-foreground`.
- **Don't use browser default scroll indicators** on custom panels; use `<ScrollArea>` primitives for cohesive styling.
- **Don't change corner radius options** on ad-hoc components. Always inherit from `--radius` configurations using `--radius-sm`, `--radius-md`, etc.
