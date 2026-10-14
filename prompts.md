# Nearfield Website — Staged Improvement Prompts

> **How to use this file:** Each stage is a self-contained, copy-paste-ready prompt.
> Run them in order. Each stage builds on the previous.
> Skills referenced are all available in `.agents/skills/`.

---

## AUDIT SUMMARY (What's wrong right now)

Before diving into stages, here's the current state analysis:

### Critical Issues
- **Mobile nav overflow**: The nav island at `<640px` still shows the GitHub star pill, theme toggle, and brand name all cramped into 50px height — elements clip and overlap on small screens (320–375px range)
- **Map completely unusable on mobile**: The `#hero-map` has `min-height: 280px; max-height: 330px` on mobile — with the hero grid stacking, the map appears BELOW the entire hero copy and search form, meaning users must scroll ~600px before even seeing it. The map controls (HUD pill + recenter button) are tiny 10.5px text with no 44px touch targets
- **AQI gauge radial SVG clips on mobile**: The `aqi-gauge-wrap` uses `grid-template-columns: 150px 1fr` and never collapses — the 150px gauge bleeds into the right column on narrow screens
- **Cigarette section body grid never collapses properly**: `grid-template-columns: 1.3fr .7fr` with `gap: 32px` — the right context box gets squished below 400px
- **WQI inputs grid stays 2-col at 640px**: Too dense for thumb interaction — inputs are `42px` min-height but the 2-col layout leaves only ~155px per field including label
- **No loading/skeleton states**: Every panel shows raw `--` dashes until data loads — no skeleton, no shimmer, no progressive reveal
- **Inline style spaghetti**: Dozens of `style="..."` attributes scattered throughout the HTML, making theming and dark-mode consistency unpredictable
- **The hero has no visual asset**: Left column is pure text+form, right column is a map widget — on mobile both stack and there is zero hero photography or illustration. The page fails the "text + gradient blob = placeholder" test from the design-taste skill
- **Eyebrow overuse**: The current design has eyebrow-style labels on nearly every section, violating the max 1-per-3-sections rule from `design-taste-frontend`
- **No scroll reveal on most sections**: Only the `result-notice` has a reveal animation; the data panels, cigarette card, WQI section all appear instantly with no entrance choreography
- **Mobile bottom dock active state doesn't update on scroll**: The JS for IntersectionObserver-based dock activation appears missing; all dock items stay in default muted state
- **The `#hero-map` leaflet map initializes at India center (20.59, 78.96)** but the map coords chip always shows "18.990° N, 72.850° E" on load — hardcoded mismatch

---

## STAGE 1 — Mobile Layout Foundation & Touch Ergonomics Fix

**Skills to activate:** `redesign-existing-projects`, `design-taste-frontend`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/redesign-existing-projects/SKILL.md
- .agents/skills/design-taste-frontend/SKILL.md

TASK: Fix all critical mobile layout breakages and touch ergonomics. Do NOT change any desktop layout — target only @media (max-width: 960px) and smaller breakpoints.

SPECIFIC FIXES REQUIRED:

1. NAV ISLAND MOBILE (max-width: 640px):
   - The nav-inner at 50px height with brand-logo, brand-name, github-star-pill AND theme-toggle is overcrowded at 320px screens
   - Compress to: show ONLY brand-logo-img (28px) + brand-name (14px) on left, theme-toggle (36x36px) on right
   - Move the github-star-pill into the mobile-bottom-dock as an extra item OR hide it entirely on screens under 400px
   - Ensure nav-inner has no horizontal scroll

2. AQI GAUGE WRAP COLLAPSE (max-width: 640px):
   - The .aqi-gauge-wrap uses grid-template-columns: 150px 1fr — this never wraps and clips at narrow widths
   - Change to: grid-template-columns: 1fr at max-width: 480px, stacking the gauge above the aqi-info block
   - The .aqi-radial-wrap should center itself when stacked (width: 120px, margin: 0 auto)
   - The .aqi-center-num font-size should reduce to 28px on mobile

3. HERO MAP POSITIONING:
   - On mobile the hero-grid stacks: copy on top, map below. The map ends up below 500px of scroll
   - At max-width: 960px, swap the order so the map appears FIRST (order: -1 on .map-bezel-outer), then the hero copy below
   - Reduce .map-bezel-outer min-height to 260px on mobile and cap at 300px max-height
   - Ensure #hero-map min-height matches the outer bezel

4. TOUCH TARGETS:
   - All .water-filter-btn, .wqi-preset-btn, .cig-preset-pill, .aqi-std-btn, .duration-btn must have min-height: 44px and min-width: 44px on mobile
   - The .map-hud-pill and .map-action-btn must have min-height: 40px on mobile
   - The .search-btn-pill must be min-height: 48px on mobile (primary action)

5. CIGARETTE SECTION:
   - .cigarette-body at max-width: 480px — force grid-template-columns: 1fr, stack the .cig-context-box below .cig-hero-stat with 20px gap
   - .cig-big-num at under 480px: use font-size: clamp(40px, 14vw, 60px) — the current 7vw at 44px min clips on some Androids

6. WATER STATIONS LIST:
   - .water-measurements-grid at under 480px: change to grid-template-columns: 1fr (single column)
   - .water-stations-list max-height on mobile: 380px (reduce from 480px)

7. WQI INPUTS:
   - At max-width: 480px, force .wqi-inputs-grid to grid-template-columns: 1fr (single column) for better thumb reach
   - Each .wqi-input-box should have min-height: 48px on mobile

8. MOBILE DOCK ACTIVE STATE:
   - Add an IntersectionObserver in the JavaScript that watches each section (#hero-section, #air-water, #wqi-section, #cigarette-section, #history-section) with threshold: 0.3
   - When a section intersects, find the matching .dock-item by data-dock attribute and toggle the .active class

After making all changes, verify that at 375px width there is no horizontal overflow anywhere on the page.
```

---

## STAGE 2 — Visual Hierarchy, Typography & Color System Upgrade

**Skills to activate:** `high-end-visual-design`, `redesign-existing-projects`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/high-end-visual-design/SKILL.md
- .agents/skills/redesign-existing-projects/SKILL.md

TASK: Upgrade the visual design system — typography scale, color depth, spacing rhythm, and section hierarchy. Keep the existing Forest Slate palette and Outfit+JetBrains Mono font stack — these are good. Elevate everything else.

SPECIFIC UPGRADES:

1. TYPOGRAPHY SCALE (do NOT change fonts, just calibrate sizes and weights):
   - h1: Keep clamp(38px, 5.5vw, 64px) but add text-wrap: balance and font-weight: 900. On mobile (640px max) use clamp(30px, 9vw, 44px)
   - Add a dedicated .display-eyebrow class: font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; color: var(--green). Replace ALL existing inline eyebrow-style spans with this class. Maximum 3 .display-eyebrow instances on the entire page (count: the hero status badge, the standards section label, and one more of your choice)
   - All section h2 headings: font-size: clamp(22px, 3vw, 32px); letter-spacing: -0.03em; font-weight: 800
   - Data numbers (.aqi-center-num, .cig-big-num, .proj-val, .wqi-big-score): add font-variant-numeric: tabular-nums for clean alignment

2. SURFACE DEPTH — add micro-texture to key surfaces:
   - Add a subtle noise grain overlay to the .hero-section background using an SVG filter:
     Add to a hidden inline SVG in the body: an feTurbulence filter with id="grain", baseFrequency="0.65", numOctaves="3"
     Apply with: .hero-section::before { content:''; position:absolute; inset:0; filter:url(#grain); opacity:0.028; pointer-events:none; z-index:0; }
   - The .cigarette-card and .wqi-card should get a very subtle secondary radial gradient:
     Add a ::after pseudo-element (NOT ::before which already exists on .cigarette-card): radial-gradient at 80% 20%, rgba(46,107,69,.04) transparent at 60%

3. EYEBROW RESTRAINT — strip excessive labels:
   - Remove the .cig-section-label text ("Air Quality Cigarette Calculator") from the cig-card-head — the section heading in the badge already communicates this
   - Remove the "Regulatory Benchmarks" eyebrow above the standards section — the h2 is sufficient
   - Keep only: hero status badge, and the standards-section section-level label

4. SECTION SPACING — increase breathing room:
   - .cigarette-section padding: 56px 0 32px (up from 40px)
   - .wqi-section padding: 56px 0 32px (up from 40px)
   - .history-section padding: 64px 0 (up from 48px)
   - #standards-section padding: 20px 0 64px

5. DATA PANEL CARDS — add more visual depth:
   - .panel-bezel and .data-grid gap: increase to 24px (from 20px)
   - Add a hairline top accent to .panel-card: border-top: 2px solid var(--green-glow) at the very top edge
   - .pollutant-tile: increase border-radius to 14px, add transition: border-color 0.2s ease on hover with border-color: var(--green-light)

6. PROJECTION TILES (.proj-tile) — make them feel more premium:
   - Add background: linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%)
   - Add a 1px top accent: border-top: 2px solid transparent, and on .cigarette-card.safe-air .proj-tile: border-top-color: var(--green-glow)

7. STANDARDS GRID — break the 3-equal-cards monotony:
   - Change .standards-grid to grid-template-columns: 1.15fr 1fr 0.85fr to create slight asymmetry
   - The first .standard-bezel should span full height with slightly more padding inside

After changes: audit every visible text string for orphaned words and add text-wrap: balance to h2, h3 elements.
```

---

## STAGE 3 — Hero Section Redesign with Visual Asset

**Skills to activate:** `image-to-code`, `imagegen-frontend-web`, `high-end-visual-design`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/image-to-code/SKILL.md
- .agents/skills/imagegen-frontend-web/SKILL.md
- .agents/skills/high-end-visual-design/SKILL.md

TASK: The hero section currently has NO visual asset — just text+form on the left and a map on the right. This fails the design-taste skill's "text + blob = placeholder" test. Fix this by adding a premium hero visual layer and enhancing the hero section composition.

STEP 1 — GENERATE HERO BACKGROUND IMAGE:
Use the generate_image tool to create a hero background image with these specs:
- Aspect ratio: 16:9
- Content: An aerial or satellite-view inspired abstract texture of an Indian city — warm greens and greys suggesting vegetation and urban density, forest patches mixed with suburban grids. Very subtle, almost monochromatic in the brand's Forest Slate palette. Low saturation (sage, slate, deep green). Should feel like a topo map / aerial photography hybrid. NO text, NO UI elements.
- Style: Editorial, cinematic, used as a subtle background texture at 8-12% opacity behind the hero copy
- Save as: hero_texture_bg

STEP 2 — ADD BACKGROUND TO HERO:
- Place the generated image as a CSS background on .hero-section:
  background-image: url('[path to generated image]');
  background-size: cover;
  background-position: center;
  Apply a gradient overlay via ::before pseudo element that fades from var(--bg) at 55% to transparent.

STEP 3 — GENERATE HERO ACCENT GRAPHIC:
Use generate_image again to create:
- Aspect ratio: 1:1
- Content: An abstract minimal data visualization graphic — concentric rings or radar-sweep circles in deep forest green on near-black background, like an environmental monitoring radar display. Very geometric, precise, premium. No text. Brand feel: precision environmental instrument.
- Save as: hero_radar_accent

STEP 4 — ADD ACCENT GRAPHIC TO HERO:
- Place the radar accent image as a decorative element in the hero, positioned in the top-right quadrant of the hero section (behind the map bezel):
  Position: absolute, right: -60px, top: -40px, width: 320px, opacity: 0.06 in light mode, 0.1 in dark mode
  z-index: 0, pointer-events: none

STEP 5 — HERO COPY ENHANCEMENT:
- Add a subtle animated gradient underline to the h1 .accent span:
  background: linear-gradient(90deg, var(--green), var(--green-light));
  background-size: 200% 2px;
  background-position: bottom left;
  background-repeat: no-repeat;
  padding-bottom: 4px;
  Animate with @keyframes accent-slide from background-size: 60% 2px to 100% 2px, 3s infinite alternate

STEP 6 — MOBILE HERO:
- On mobile (640px max), the hero background image opacity should reduce to 0.05 so it doesn't compete with text readability
- The radar accent graphic should be hidden on mobile (display: none at 640px)
```

---

## STAGE 4 — Scroll Reveal Animations & Entrance Choreography

**Skills to activate:** `gpt-taste`, `design-taste-frontend`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/gpt-taste/SKILL.md
- .agents/skills/design-taste-frontend/SKILL.md

TASK: Add a comprehensive scroll-reveal system using IntersectionObserver (NO GSAP — keep it vanilla JS since this is a single-file app). Currently only the .result-notice has an entrance animation. Every major section should have a choreographed entrance.

REVEAL SYSTEM TO BUILD:

1. CREATE THE REVEAL OBSERVER in the JS IIFE after the existing theme toggle code:

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      const children = entry.target.querySelectorAll('.reveal-child');
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 80);
      });
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => revealObserver.observe(el));

2. ADD REVEAL CSS VARIANTS in the style block:

.reveal-from-left { opacity: 0; transform: translateX(-24px); transition: opacity var(--dur-slow) var(--ease-out-expo), transform var(--dur-slow) var(--ease-out-expo); }
.reveal-from-left.visible { opacity: 1; transform: translateX(0); }
.reveal-from-right { opacity: 0; transform: translateX(24px); transition: opacity var(--dur-slow) var(--ease-out-expo), transform var(--dur-slow) var(--ease-out-expo); }
.reveal-from-right.visible { opacity: 1; transform: translateX(0); }
.reveal-scale { opacity: 0; transform: scale(0.96); transition: opacity var(--dur-slow) var(--ease-out-expo), transform var(--dur-slow) var(--ease-out-expo); }
.reveal-scale.visible { opacity: 1; transform: scale(1); }
.reveal-delay-1 { transition-delay: 80ms; }
.reveal-delay-2 { transition-delay: 160ms; }
.reveal-delay-3 { transition-delay: 240ms; }
.reveal-delay-4 { transition-delay: 320ms; }

Add @media (prefers-reduced-motion: reduce) block that sets opacity:1 !important and transform:none !important for all reveal classes.

3. APPLY REVEAL CLASSES TO HTML ELEMENTS:

Hero Section:
- .status-badge: add class reveal reveal-delay-1
- h1#hero-title: add class reveal reveal-delay-2
- .hero-sub: add class reveal reveal-delay-3
- .search-bezel-outer: add class reveal reveal-delay-4
- .map-bezel-outer: add class reveal-from-right

Air+Water Section:
- First .panel-bezel (air): add class reveal-from-left
- Second .panel-bezel (water): add class reveal-from-right

Cigarette Section:
- .cig-bezel-outer: add class reveal-scale
- Wrap .cig-projections in a div.reveal-stagger and each .proj-tile gets class reveal-child

WQI Section:
- .wqi-bezel: add class reveal
- .wqi-source-switcher: add class reveal reveal-delay-1

History Section:
- .history-bezel: add class reveal-scale

Standards Section:
- Wrap .standards-grid in a div.reveal-stagger and each .standard-bezel gets class reveal-child

OSS Banner:
- .oss-bezel: add class reveal

4. HERO PAGE-LOAD ENTRANCE ANIMATION:
Add @keyframes hero-in { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
Apply with staggered animation-delay to: .status-badge (0.1s), h1 (0.22s), .hero-sub (0.36s), .search-bezel-outer (0.48s), .map-bezel-outer (0.3s delay, 0.9s duration)
Set initial opacity: 0 on these elements and let the animation bring them in.

5. MOBILE: All reveal animations work the same on mobile. No changes needed to the observer code for mobile — the 0.12 threshold is mobile-friendly.
```

---

## STAGE 5 — Data Visualization Upgrade (AQI Gauge, Sparkline & History Chart)

**Skills to activate:** `gpt-taste`, `full-output-enforcement`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/gpt-taste/SKILL.md
- .agents/skills/full-output-enforcement/SKILL.md

TASK: Upgrade the three data visualizations — the AQI radial gauge, the PM2.5 sparkline, and the history chart. These currently feel like rough SVG sketches. Make them feel like a premium instrument dashboard.

1. AQI RADIAL GAUGE UPGRADE:

a) Add 6 TICK MARKS radially along the gauge arc at AQI category boundary angles — small <line> elements, 8px long, stroke: var(--line), stroke-width: 1.5

b) Add 6 separate arc path SEGMENTS behind the gauge, one per AQI category (Good/Sat/Mod/Poor/VPoor/Severe), each with the correct category color at opacity: 0.25. The active .gauge-meter overlays on top.

c) Make the gauge dot PULSE when AQI exceeds 200: add class .gauge-dot-alert with CSS animation matching the existing .live-pulse animation style.

d) Animate the .aqi-center-num to COUNT UP from 0 to the actual value on data load:
Add a function animateCounter(el, from, to, duration = 1200) using requestAnimationFrame with an ease-out-quart curve, and call it in the JS updateAQI() function.

e) On mobile (640px max), scale the gauge arc SVG using transform: scale(0.85) with transform-origin: center.

2. SPARKLINE UPGRADE:

a) Add an AREA FILL below the sparkline path: a closed <path> element tracing the line and closing at the baseline. Use a linearGradient fill from var(--green) at 0.2 opacity to transparent.

b) Add DOT MARKERS at each data point: <circle> elements, r=3, fill: var(--green), stroke: var(--surface), stroke-width: 1.5. Most recent point gets r=4.5 and a pulsing animation.

c) Add a HOVER TOOLTIP: On mousemove over the sparkline SVG, find the nearest data point and show a floating .spark-tooltip div with the AQI value and timestamp, positioned above the cursor.

d) Replace the current plain SVG text placeholder with a styled empty state: centered icon + two text lines with different font sizes and colors.

3. HISTORY CHART UPGRADE:

a) Add horizontal dashed BIS REFERENCE LINES for each parameter (Total Hardness: 200mg/L, TDS: 500mg/L, pH 8.5, Fluoride: 1.0, Nitrate: 45, Chloride: 250). Use stroke-dasharray="4,4", stroke: var(--amber), opacity: 0.6 with small right-side labels.

b) Animate the chart line DRAWING from left to right when new data loads using stroke-dasharray/stroke-dashoffset animation (set both to pathLength, then transition stroke-dashoffset to 0 over 1.2s with ease-out-expo).

c) Add an AREA FILL under the history chart line, same gradient approach as sparkline.

d) Replace the plain SVG text empty state with a styled empty state (icon + two text lines).

4. MOBILE CHART ADAPTATIONS:
- History chart SVG: change preserveAspectRatio to "xMidYMid meet" and add viewBox="0 0 400 170" for better mobile proportion
- Sparkline on mobile: reduce height to 55px (from 70px)
- AQI gauge on mobile: use transform: scale(0.78) on the .aqi-radial-wrap
```

---

## STAGE 6 — Loading States, Skeleton UI & Error Handling

**Skills to activate:** `design-taste-frontend`, `full-output-enforcement`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/design-taste-frontend/SKILL.md
- .agents/skills/full-output-enforcement/SKILL.md

TASK: Add comprehensive loading states, skeleton screens, and error handling. Currently the app shows raw "--" dashes while loading and has no visual feedback during API calls.

1. SKELETON LOADER CSS:
Add @keyframes skeleton-shimmer with a moving background gradient animation.
Add .skeleton class using a linear-gradient background that sweeps from left to right using the animation, with colors based on var(--surface-2) and var(--surface-3).

2. AIR QUALITY PANEL SKELETON:
Create a div#aqi-skeleton (hidden by default) that mirrors the structure of the AQI panel:
- A circular skeleton for the gauge (140x128px, border-radius: 50%)
- Skeleton bars for the info column
- 6 skeleton tiles in a pollutant grid (height: 76px, border-radius: 12px each)
In JS: show #aqi-skeleton and hide #aqi-content during active searches; reverse when data loads.

3. GROUNDWATER PANEL SKELETON:
Create a div#water-skeleton (hidden by default) with 3 skeleton cards (height: 120px, border-radius: 16px).
Same pattern: show when loading, hide when water data renders.

4. MAP LOADING STATE:
When flyTo is called, temporarily add a .map-loading class to .map-bezel-inner that shows a glass overlay (via ::after pseudo-element with backdrop-filter: blur(4px) and background: var(--surface-glass)). Remove after 1.5 seconds.

5. ERROR STATES:
Add a showPanelError(panelEl, message) function that creates a styled error banner with:
- An amber-colored warning icon (SVG circle with exclamation)
- A bold title "Data unavailable"
- A description paragraph with the error message
- A dismiss button
Style .panel-error-state with amber background (var(--amber-bg)), amber border, border-radius: var(--r-md), reveal-up animation.

6. SEARCH BUTTON LOADING STATE:
When search is pending, add a .loading class to .search-btn-pill.
The .loading state replaces the arrow icon with a spinning circle animation (via ::before pseudo-element on .btn-icon-wrap) and hides the arrow SVG.
Add @keyframes spin { to { transform: rotate(360deg); } }.
Remove .loading class when search completes (success or error).

7. MOBILE: All skeleton tiles must respect the same grid breakpoints as their real counterparts. Test that skeletons display correctly at 375px width.
```

---

## STAGE 7 — Glassmorphism & Premium Card Polish

**Skills to activate:** `high-end-visual-design`, `redesign-existing-projects`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/high-end-visual-design/SKILL.md
- .agents/skills/redesign-existing-projects/SKILL.md

TASK: Elevate the glass/surface quality of all premium cards and overlays. The double-bezel pattern is already in place — refine its execution to agency-tier quality.

1. NAV ISLAND GLASS ENHANCEMENT:
Upgrade .nav-inner box-shadow to include: main shadow + inner highlight top (rgba(255,255,255,.55) inset) + subtle inner shadow bottom (rgba(0,0,0,.04) inset).
Upgrade the border to rgba(220,226,216,0.7) for light mode.
Dark mode version: use rgba(255,255,255,.07) and rgba(255,255,255,.05) inset highlights.

2. MAP HUD PILL QUALITY:
Make .map-hud-pill feel like a premium instrument overlay:
- background: rgba(255,255,255,0.88) in light mode
- backdrop-filter: blur(20px) saturate(180%)
- box-shadow: soft color shadow + inner top highlight (rgba(255,255,255,.9))
- border: 1px solid rgba(220,226,216,0.6)
Dark mode equivalent using rgba(22,32,25,.92) background and rgba(255,255,255,.06) inset.

3. PANEL BEZEL REFINEMENT:
- Add inner highlights to .panel-card via box-shadow inset (top: rgba(255,255,255,.8), bottom: rgba(0,0,0,.03))
- Add a decorative ::before element on .panel-card (set position: relative on .panel-card): a 2px gradient line at the top using linear-gradient(90deg, var(--green-glow), transparent 50%)

4. CIGARETTE CARD ATMOSPHERE:
- Expand .cigarette-card::before to be larger (520x520px), positioned further outside (top: -200px, right: -120px), with a deeper gradient: radial-gradient with 3 stops (inner, mid, transparent at 70%)
- Add a .cigarette-card::after pseudo-element: a second smaller radial gradient from the bottom-left corner to add depth and dual light sourcing

5. WATER CARDS DEPTH:
- .water-card: add diagonal gradient background (linear-gradient 145deg from var(--surface-2) to var(--surface-3))
- .water-card::before: a 1px hairline gradient at the top edge from transparent to var(--blue-bg) to transparent
- .water-card:hover: upgrade to show gradient from var(--surface) to var(--surface-2) + translateY(-2px) + subtle shadow

6. MOBILE GLASS FALLBACK:
Add @supports not (backdrop-filter: blur(1px)) block that sets .nav-inner, .map-hud-pill, .map-action-btn, and .mobile-dock-inner to use solid var(--surface) background at 0.97 opacity as fallback.

7. DARK MODE SURFACE CALIBRATION:
Add diagonal gradient backgrounds to .panel-bezel, .panel-card, .cigarette-card, and .wqi-card in dark mode to add depth and prevent the flat appearance that comes from uniform dark backgrounds.
```

---

## STAGE 8 — Interactive Micro-Animations & Hover Physics

**Skills to activate:** `gpt-taste`, `high-end-visual-design`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/gpt-taste/SKILL.md
- .agents/skills/high-end-visual-design/SKILL.md

TASK: Add tactile micro-interactions and hover physics throughout the UI. No GSAP — use CSS transitions and vanilla JS pointer events only.

1. MAGNETIC BUTTON EFFECT on .search-btn-pill (desktop only, gate behind hover: hover media query):
Add mousemove and mouseleave event listeners to .search-btn-pill.
On mousemove: calculate distance from center and apply transform: translate(Xpx, Ypx) with a 0.15 damping factor.
On mouseleave: reset transform with a spring-like transition (cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s).

2. PROJ-TILE HOVER EFFECTS:
- Add hover: translateY(-4px) scale(1.02) + box-shadow + border-color: var(--green)
- On hover, the .proj-val inside should slightly scale up (scale(1.08)) with its own spring transition
- Use var(--ease-spring) for all transitions

3. AQI SCALE-STEP HOVER:
Enhance the existing scale-step hover to include: z-index: 2, position: relative, box-shadow: 0 4px 12px rgba(0,0,0,.25), scaleY(1.3) scaleX(1.05)

4. DOCK ITEM SPRING BOUNCE (mobile):
- Add spring transition to .dock-item for transform, color, background
- .dock-item:active: scale(0.88)
- .dock-item.active svg: scale(1.12) with spring

5. WATER FILTER BUTTON MORPHING FILL:
- Add ::before pseudo-element on .water-filter-btn that starts at scaleX(0) with background: var(--green) and border-radius: inherit
- On .active state: scaleX(1) with var(--ease-out-expo) transition
- Ensure text remains z-index: 1 above the fill
- .active text color: #fff, border-color: transparent

6. BRAND LOGO SPRING:
Upgrade .brand:hover .brand-logo-img to: scale(1.12) rotate(-5deg) + box-shadow with green glow ring (0 0 0 3px var(--green-glow))

7. CIG-RACK STAGGER POP:
In the JS cigarette rack render function, add animation-delay: (index * 35)ms to each .cig-item element after creation so they pop in one by one.

8. SEARCH CHIP HOVER RIPPLE:
Add ::after pseudo-element on .search-chips button with background: var(--green-glow), opacity: 0 normally, opacity: 1 on hover. Transition opacity.

9. MOBILE SAFETY: All pointer-event-based JS effects must be gated behind window.matchMedia('(hover: hover)').matches check. Do not apply magnetic effects on touch devices.
```

---

## STAGE 9 — Performance, SEO & Accessibility Hardening

**Skills to activate:** `full-output-enforcement`, `design-taste-frontend`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/full-output-enforcement/SKILL.md
- .agents/skills/design-taste-frontend/SKILL.md

TASK: Harden the page for performance, SEO, and accessibility without breaking any existing functionality.

1. SEO & META TAGS — add to head section:
- meta name="keywords" with relevant India air quality, AQI, CPCB, groundwater, CGWB, WQI terms
- meta name="author" content="Pavitra (@GWPx7Pavitra)"
- meta name="robots" content="index, follow"
- Open Graph tags: og:title, og:description, og:type (website), og:url
- Twitter card meta tags: twitter:card (summary_large_image), twitter:title, twitter:description

2. FONT LOADING OPTIMIZATION:
- Change the Google Fonts <link> from render-blocking to: rel="stylesheet" media="print" onload="this.media='all'" plus a noscript fallback
- Add a <link rel="preload"> for the critical Outfit font woff2 file

3. LEAFLET LAZY LOADING:
- Change Leaflet CSS from <link rel="stylesheet"> to <link rel="preload" as="style" onload="this.rel='stylesheet'"> with noscript fallback
- Change Leaflet JS from synchronous <script> to <script defer>
- Gate the initMap() call: check if (typeof L !== 'undefined') before calling Leaflet APIs

4. ACCESSIBILITY — ARIA and semantic fixes:
a) .aqi-std-switch: change role to "radiogroup", each button becomes role="radio" with aria-checked="true/false" (update dynamically in JS)
b) .cig-duration-pills: same pattern as above — role="radiogroup" on container, role="radio" aria-checked on each button
c) .wqi-source-switcher already has role="tablist" — ensure active tab has tabindex="0" and inactive tabs have tabindex="-1"; tab panels get role="tabpanel"
d) AQI gauge SVG: add role="img" with a dynamic aria-label updated when AQI changes: "AQI gauge showing [value] — [category]"
e) Sparkline SVG: add role="img" aria-label="PM2.5 and AQI trend over the last 48 hours"

5. FOCUS VISIBLE STYLES:
Add :focus-visible styles for keyboard navigation since current reliance on browser defaults is inconsistent:
:focus-visible { outline: 2px solid var(--green); outline-offset: 3px; border-radius: 4px; }
Apply specifically to button:focus-visible and a:focus-visible as well.

6. INLINE STYLE AUDIT:
- Add a .text-muted-xs CSS class (font-size: 11px; color: var(--muted)) and use it to replace common repeated inline styles in the OSS card, history section, and standards section
- Do NOT touch Leaflet popup inline styles — they are necessary

7. REDUCE MOTION — audit and fix:
Wrap ALL animations that are currently always-on in @media (prefers-reduced-motion: no-preference):
- .live-pulse, .radar-pulse-ring, .cig-ember, .cig-item animations
Add @media (prefers-reduced-motion: reduce) block that sets animation: none on these elements.

8. EXTERNAL LINK SECURITY:
Audit all <a target="_blank"> elements and ensure every one has rel="noreferrer" (not just rel="noopener"). Verify the footer links, OSS banner links, and nav links.

9. MOBILE PERFORMANCE — reduce GPU pressure at 640px and below:
Reduce backdrop-filter blur values: .nav-inner and .mobile-dock-inner to blur(14px), .map-hud-pill and .map-action-btn to blur(8px).
```

---

## STAGE 10 — Final Polish, Dark Mode Calibration & Brand Consistency

**Skills to activate:** `redesign-existing-projects`, `high-end-visual-design`, `full-output-enforcement`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skills at:
- .agents/skills/redesign-existing-projects/SKILL.md
- .agents/skills/high-end-visual-design/SKILL.md
- .agents/skills/full-output-enforcement/SKILL.md

TASK: Final pass — dark mode calibration, brand consistency, content polish, and all remaining rough edges. This is the quality-gate stage. Output must be COMPLETE — no truncation allowed. If the file is too large for a single output, split into clearly labeled parts and complete each one.

1. DARK MODE SYSTEMATIC AUDIT:
Go through every element that has or needs [data-theme="dark"] overrides and verify:
a) .cig-alert-badge dark mode: add border-color: rgba(248,113,113,.25)
b) .wqi-inputs-card dark mode: background: var(--surface-2); border-color: var(--line)
c) .wqi-scale-step dark mode: background: var(--surface-2); border-color: var(--line)
d) History chart SVG text: verify fill="var(--muted)" resolves correctly in both themes at runtime
e) .cig-formula code block dark mode: background: rgba(245,184,67,.1); border-left-color: var(--amber)
f) All status tags (.status-tag.normal etc.): verify dark mode color overrides are applied and render correctly

2. BRAND IDENTITY NORMALIZATION:
a) The brand name treatment "near<span>field</span>" (with span making "field" green) is inconsistent — the footer shows a solid green "nearfield". Pick one treatment:
   Recommended: "near" in var(--ink), "field" in var(--green) — apply this consistently in the nav brand, OSS card h3, and footer
b) The .oss-logo img: add alt="Nearfield" and explicit width="48" height="48" attributes to prevent layout shift
c) The WQI "📍 Load City Water Baseline" button — replace the 📍 emoji with an inline SVG pin icon that matches the site's existing SVG style (thin stroke, 13x13px)
d) Similarly audit all other emoji in button labels in the WQI presets rows and replace with matching SVG icons

3. CONTENT COPY POLISH:
a) History section subtitle: change to "Multi-year laboratory records from verified CGWB observation wells, plotted against BIS IS 10500:2012 limits."
b) WQI .wqi-location-sub paragraph: trim to "Evaluate potability and water body health according to official BIS, CPCB, and MoEFCC benchmarks. Enter measured values below."
c) .cig-live-calc-box: remove the redundant "(approx. AQI / 22)" from the inline text — it's already shown in the formula block below

4. SPACING CONSISTENCY:
a) .wqi-card-head margin-bottom and .wqi-source-switcher margin-bottom: normalize both to 20px
b) .cig-card-head margin-bottom and .cig-calculator-bar margin-bottom: normalize both to 24px
c) All .panel-head padding-bottom: normalize to 16px everywhere

5. FOOTER UPGRADE:
a) Add a tagline paragraph above the .footer-row:
   "Nearfield is a free, open-source tool for environmental transparency. Zero tracking, zero telemetry. Data from official CPCB, CGWB, and OpenStreetMap sources."
   Style: font-size: 12.5px, color: var(--ink-soft), margin-bottom: 20px, line-height: 1.5
b) Add a decorative gradient ::before line at the top of footer: height: 2px, linear-gradient(90deg, transparent, var(--green-glow), transparent)
c) At max-width: 480px, change .footer-links to: display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px (instead of flex wrap)

6. GITHUB STAR COUNT:
If the fetch for GitHub stars doesn't already exist in the JS, add:
fetch('https://api.github.com/repos/GWPx7Pavitra/nearfield')
  .then(r => r.json())
  .then(d => {
    const el = document.getElementById('gh-star-count');
    if (el && d.stargazers_count) el.textContent = d.stargazers_count >= 1000
      ? (d.stargazers_count / 1000).toFixed(1) + 'k'
      : d.stargazers_count;
  })
  .catch(() => {});
Add this after initMap() is called.

7. HARDCODED MAP COORDINATES BUG:
The .map-coords-chip shows "18.990° N, 72.850° E" on page load but the map initializes at [20.5937, 78.9629].
Fix: In JS after initMap(), set:
document.getElementById('map-coords-chip').textContent = '20.594° N, 78.963° E';

8. FINAL MOBILE CHECKLIST — fix any failing items:
- [ ] Nav island: no horizontal overflow at 375px
- [ ] Hero copy visible without deep scrolling
- [ ] Map at reasonable height (260-300px) and appears before or right after the search form
- [ ] Search form: font-size >= 16px in input (prevents iOS auto-zoom)
- [ ] Mobile dock: 5 items, no overflow, active state updates on scroll
- [ ] AQI gauge: centered, fits within panel at 375px
- [ ] Pollutant grid: 2 columns at 375px, 1 column at 320px
- [ ] Cigarette section: body stacked, no horizontal overflow
- [ ] WQI inputs: 1 column at 375px (or 2 if inputs are still comfortable)
- [ ] All interactive touch targets: 44px minimum
Fix any failing items before declaring Stage 10 complete.
```

---

## MOBILE VIEW — Priority Fix Prompt (Run independently or before Stage 1)

**Skills to activate:** `redesign-existing-projects`

**Prompt:**

```
You are working on /Users/Works/Downloads/Nearfield_Website_Source/public/index.html

Read and follow the skill at:
- .agents/skills/redesign-existing-projects/SKILL.md

TASK: Fix the mobile view comprehensively. This is a priority-zero issue. The page must be fully usable on 375px (iPhone SE/standard) and 390px (iPhone 14) viewports. All fixes go inside existing max-width breakpoint blocks. Do NOT break any desktop layout.

PRIORITY 1 — NAV CLUTTER (375px):
At max-width: 480px, hide .github-star-pill completely.
OR: Show only the .star-badge count number inline next to the theme toggle (no icon, no text).

PRIORITY 2 — MAP ORDER (all mobile):
At max-width: 960px, apply CSS order to bring the map before the search form:
.map-bezel-outer { order: -1; }
.hero-copy { order: 1; }
Reduce map container: max-height: 45vw; min-height: 220px.

PRIORITY 3 — AQI GAUGE OVERFLOW (375px):
At max-width: 520px:
- .aqi-gauge-wrap: grid-template-columns: 1fr
- .aqi-radial-wrap: margin: 0 auto; width: 130px; height: 120px
- .aqi-center-num: font-size: 26px
Stack order: gauge on top, aqi-info below.

PRIORITY 4 — CIGARETTE BIG NUMBER (375px):
At max-width: 480px:
.cig-big-num { font-size: 48px; letter-spacing: -2px; }
(Override the clamp that clips at 44px minimum)

PRIORITY 5 — WQI SCORE DISPLAY (375px):
At max-width: 480px:
.wqi-big-score { font-size: 40px; }

PRIORITY 6 — SEARCH CHIPS LABEL:
At max-width: 480px:
.search-chips-label { display: none; }
(Gives chips more horizontal room)

PRIORITY 7 — HISTORY CONTROLS:
At max-width: 380px:
.history-controls { grid-template-columns: 1fr; }

PRIORITY 8 — FOOTER LINKS:
At max-width: 480px:
.footer-links { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

After all fixes: test at 320px, 375px, 390px, 430px and confirm no horizontal overflow on any viewport.
```

---

## Stage Reference Table

| Stage | Primary Skill | Secondary Skills | Complexity |
|-------|--------------|-----------------|------------|
| Mobile Fix (priority) | `redesign-existing-projects` | — | Medium |
| 1 — Mobile Foundation | `redesign-existing-projects` | `design-taste-frontend` | Large |
| 2 — Typography & Color | `high-end-visual-design` | `redesign-existing-projects` | Medium |
| 3 — Hero Visual Asset | `image-to-code` | `imagegen-frontend-web`, `high-end-visual-design` | Large |
| 4 — Scroll Animations | `gpt-taste` | `design-taste-frontend` | Large |
| 5 — Data Visualization | `gpt-taste` | `full-output-enforcement` | Large |
| 6 — Loading States | `design-taste-frontend` | `full-output-enforcement` | Medium |
| 7 — Glass & Cards | `high-end-visual-design` | `redesign-existing-projects` | Medium |
| 8 — Micro-animations | `gpt-taste` | `high-end-visual-design` | Medium |
| 9 — Performance & A11y | `full-output-enforcement` | `design-taste-frontend` | Large |
| 10 — Final Polish | `redesign-existing-projects` | `high-end-visual-design`, `full-output-enforcement` | Large |

> **Recommended order:** Run the **Mobile Fix prompt first**, then stages 1 through 10 in sequence. Each stage builds on the previous.
