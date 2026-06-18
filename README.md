# Pod 5 — Interactive Sales Presentation (FBLA Nationals)

An interactive, website-style version of the Eight Sleep **Pod 5** sales presentation
for the FBLA **Sales Presentation** event. Instead of a fixed slide deck, the
presentation **adapts to the judges' answers**: during needs determination you tap
**which judge** raised each problem, and the deck then builds a personalized path —
a "Your Personalized Plan" agenda, **only the matching solution slides** (each tagged
*"For Judge 1 · 3"*), and a closing recap that ties every need back to a product and
asks for the sale. This mirrors the official rating sheet, which rewards determining
needs, relating them to the product, and closing.

## ✅ Built for the official rules
- **Runs 100% offline.** No internet, no CDNs, no web-loaded fonts — everything
  (fonts, images, code) is bundled in this folder. The event provides **no internet**.
- **Clicker / keyboard friendly** (wireless advancers are allowed).
- **No links or QR codes** are presented to judges.
- 16:9, auto-scales to any laptop/tablet screen.

## ▶️ How to run
1. Keep this whole folder together (don't move files out of it).
2. **Double-click `index.html`** — it opens in your default browser. (Chrome recommended.)
3. On the setup screen, **type the number of judges** (use −/+ or the field) and an
   optional section/room label, then click **Start Presentation**. The judge count
   controls how many judge chips (J1, J2, …) appear on each problem card.
4. Press **F** for fullscreen before you begin.

> Tip: copy the entire folder to a USB drive / your presentation laptop ahead of time
> and test it offline (turn Wi-Fi off) to confirm everything loads.

## 🎛️ Controls
| Key | Action |
|-----|--------|
| `→` / `Space` / `PageDown` / clicker forward | Next slide |
| `←` / `PageUp` / clicker back | Previous slide |
| `F` | Toggle fullscreen |
| `R` | Restart (back to setup screen) |
| `H` | Hide/show the slide counter |

## 🔑 The interactive moment (Problems slide)
When you reach the **PROBLEMS** slide, ask the judges the three needs-determination
questions from the script. As each judge responds, **tap the judge chip** (J1, J2, …)
on the matching problem card. A card highlights in orange once any judge is assigned,
and the summary line updates live (e.g. *Temperature (J1,J3) · Energy (J2)*).

| Problem card | Solution slide that gets shown |
|---|---|
| Can't Wake Up? | Smart Wake-Up |
| Different temperature preferences? | Dual-Zone Temperature |
| Wake up tired? | AI Temperature Adjustments (recovery chart) |

When you advance, the **"Your Personalized Plan" agenda** lists exactly the focus areas
you tagged (with their judge numbers), then **only the matching solution slides appear**,
each showing a *"Because you mentioned … — For Judge 1 · 3"* badge. If the judges raise
**none** of the problems, the agenda shows the full system and the deck **skips the
solution slides** straight to Key Features.

Always shown: Title, Problems, Agenda, Key Features, Pricing, Pod 5 Ultra, Why Us,
**Your Pod 5 Plan (recap)**, and the Close.

### 💰 Closing the sale (recap slide)
The **Your Pod 5 Plan** slide near the end recaps each need → the feature that solves it
(with judge tags), and shows a recommended-product card. Toggle **POD 5 / POD 5 ULTRA**
to match what the judge leans toward — the price counts up and a **SELECTED ✓** stamp
animates — then reinforce the ~$2/night framing, monthly financing, and the **30-day
risk-free trial** before asking for the close.

### ✨ Animations
Motion is intentionally subtle/professional: content rises in with a gentle stagger on
each slide, the recovery-sleep bars and prices count up, the Why-Us check marks pop in,
and a thin progress bar tracks your position. All motion respects
`prefers-reduced-motion`.

## 📁 Structure
```
index.html        all slide markup + setup screen
css/styles.css    styling (brand colors, layout, animations)
js/slides.js      slide order + problem → solution mapping (edit content order here)
js/app.js         setup, dynamic deck assembly, navigation, animations
assets/           product photos, phone mockup, lifestyle images (from the deck)
fonts/            bundled web fonts (Archivo + Poppins) — for offline use
```

## ✏️ Editing
- **Change which problem maps to which slide:** `js/slides.js` (`conditional` map).
- **Change wording / numbers:** edit the relevant `<section>` in `index.html`.
- **Change colors:** the CSS variables at the top of `css/styles.css` (`--orange`, etc.).

## 🧪 Manual test checklist
1. Open `index.html` with **Wi-Fi off** → it loads fully (fonts + images render).
2. Setup → type **4 judges** → Start. Press `F` for fullscreen. Confirm each problem
   card shows chips **J1–J4**.
3. On Problems, assign **Temperature → J1, J3** and **Energy → J2** (leave wake-up empty)
   → advance → confirm the **Agenda** lists Temperature (J1·3) and Energy (J2), then
   Dual-Zone (badge "For Judges 1 · 3") → AI Temp (badge "For Judge 2") → Key Features
   → Pricing → Ultra → Why Us → **Your Pod 5 Plan** → Close. Smart Wake-Up is skipped.
4. On the recap, toggle **POD 5 ULTRA** → price re-counts to $4,999 and the SELECTED
   stamp animates.
5. Restart (`R`), assign **no** judges → advance from Problems → Agenda shows the full
   system → jumps straight to Key Features (all solution slides skipped).
6. Test your wireless clicker's forward/back buttons.
7. Resize the window → the slide scales without distortion. Motion stays subtle.

## Notes on fonts
The original deck uses *Glacial Indifference* (a Canva font). For reliable offline use this
build bundles close open-source equivalents: **Archivo** for the heavy display headlines and
**Poppins** for body text. To use the exact original font, drop `GlacialIndifference-*.woff2`
into `fonts/` and add matching `@font-face` rules at the top of `css/styles.css`.
