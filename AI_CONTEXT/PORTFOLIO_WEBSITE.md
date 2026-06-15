# Portfolio Website — Build Notes

**Location:** `/web/portfolio/`  
**Stack:** React 19 + Vite + Framer Motion + Lucide React  
**Last Updated:** 2026-06-04

---

## What Was Built

A full marketing/landing website for JK Taxi targeting Tiruppur customers.

### Sections (in order)
1. **Navbar** — fixed top, always white, slide-in mobile drawer
2. **Hero** — full-screen, centered booking card
3. **Services** — 4 ride type cards with real photos
4. **Fleet** — 6 vehicle cards (Mini, Sedan, SUV, Premium, Auto, Bike)
5. **How It Works** — 4-step flow + Tiruppur area banner
6. **Safety** — split layout, photo + 6 feature cards
7. **Pricing** — 3 fare tier cards with breakdown note
8. **Testimonials** — 4 reviews + aggregate 4.9/5 rating
9. **Download** — app store CTA section with phone mockup
10. **Footer** — dark footer, contact info, links

---

## Color Palette (matches customer mobile app)

- **Purple** `#7C3AED` / `#8B5CF6` — primary brand, CTAs, active states
- **Yellow** `#FCD34D` — accent, headline highlight, active tab indicator
- **White** `#FFFFFF` — background, cards
- **Dark** `#0F172A` / `#1E293B` — text
- **Grey** `#64748B` / `#94A3B8` — secondary text, borders

---

## Style Principles Used

### Hero Section
- Full-screen section with real Pexels car photo as background
- Deep purple gradient overlay on photo: `rgba(76,29,149,0.93)` to `rgba(124,58,237,0.80)` — makes text crisp on any photo
- Everything centered (Ola-style), max-width 820px
- Headline: white + yellow second line. Yellow `#FCD34D` reads perfectly on purple
- White booking card floats in the middle — high contrast against purple bg
- Vehicle tabs: Car / Auto / Bike / Ping with Lucide icons (no emojis)
- Active tab has yellow bottom border `box-shadow: inset 0 -3px 0 #FCD34D`
- Yellow primary CTA button, ghost call button below card
- Stats row as a glass divider at the bottom of hero

### Navbar
- Always solid white — no transparent/scroll toggle (simpler, more readable)
- "JK" in purple square, "Taxi" in **Pacifico** cursive font (distinct brand feel)
- Hamburger: three bars inside a visible grey box `#F8FAFC` — never invisible
- Mobile: full-height drawer from the right, backdrop overlay, stacked CTAs

### General Rules Applied
- **No emojis anywhere** — Lucide React icons only
- **Real photos from Pexels** — not placeholder images
- Purple used only on: navbar logo, active states, CTA buttons, booking card button
- Yellow used only on: hero headline accent, active tab indicator, primary CTA
- Cards always white with `border: 1px solid #E2E8F0` and subtle shadow
- Font: Inter (body) + Poppins (headings/display) + Pacifico (logo only)
- Animations: Framer Motion, entrance only (opacity + y), no looping distractions

### Mobile Responsiveness
- Booking card route stacks vertically on mobile (pickup above, drop-off below)
- Vehicle tab sub-text and prices hidden on mobile to fit 4 tabs in one row
- Search button becomes full-width with label text on mobile
- Stats go 2×2 grid on mobile
- All CTA buttons stack to full-width on mobile

---

## How to Run

```bash
cd /home/sakthi-selvan/jk_taxi/web/portfolio
npm run dev      # development — http://localhost:5173
npm run build    # production build → dist/
```

## Dependencies Added
- `framer-motion` — animations
- `lucide-react` — icons
- `@fontsource/inter` — body font
- `@fontsource/poppins` — heading font
- `@fontsource/pacifico` — logo "Taxi" word only
