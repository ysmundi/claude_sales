# Pod 5 — Interactive Sales Presentation (FBLA Nationals)

An interactive, website-style version of the Eight Sleep **Pod 5** sales presentation
for the FBLA **Sales Presentation** event. Instead of a fixed slide deck, the
presentation **adapts to the judges' answers**: during needs determination you tap
the problems the judges raise, and the deck then shows **only the matching solution
slides**. This mirrors the official rating sheet, which rewards determining needs and
relating them to the product.

## ✅ Built for the official rules
- **Runs 100% offline.** No internet, no CDNs, no web-loaded fonts — everything
  (fonts, images, code) is bundled in this folder. The event provides **no internet**.
- **Clicker / keyboard friendly** (wireless advancers are allowed).
- **No links or QR codes** are presented to judges.
- 16:9, auto-scales to any laptop/tablet screen.

## ▶️ How to run
1. Keep this whole folder together (don't move files out of it).
2. **Double-click `index.html`** — it opens in your default browser. (Chrome recommended.)
3. On the setup screen, pick the **number of judges** and an optional section/room label,
   then click **Start Presentation**.
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
| `1` `2` `3` | (On the Problems slide) toggle a problem card |

## 🔑 The interactive moment (Problems slide)
When you reach the **PROBLEMS** slide, ask the judges the three needs-determination
questions from the script. As each judge responds, **click the matching card**
(or press `1`/`2`/`3`). Selected cards highlight in orange, and the summary line
updates live.

| Problem card | Solution slide that gets shown |
|---|---|
| Can't Wake Up? | Smart Wake-Up |
| Different temperature preferences? | Dual-Zone Temperature |
| Wake up tired? | AI Temperature Adjustments (recovery chart) |

When you advance, **only the selected solution slides appear**, in order. If the judges
indicate **none** of the problems, the presentation **skips straight to Key Features**.
Key Features, Pricing, Pod 5 Ultra, Why Us, and the Close always show.

> With multiple judges, just select every problem any judge raises — the deck covers
> the combined set.

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
2. Setup → 2 judges → Start. Press `F` for fullscreen.
3. On Problems, select **Temperature + Energy** only → advance → confirm Smart Wake-Up is
   skipped and you go Dual-Zone → AI Temp → Key Features → Pricing → Ultra → Why Us → Close.
4. Restart (`R`), select **nothing** → advance from Problems → confirm it jumps straight to
   Key Features.
5. Test your wireless clicker's forward/back buttons.
6. Resize the window → the slide scales without distortion.

## Notes on fonts
The original deck uses *Glacial Indifference* (a Canva font). For reliable offline use this
build bundles close open-source equivalents: **Archivo** for the heavy display headlines and
**Poppins** for body text. To use the exact original font, drop `GlacialIndifference-*.woff2`
into `fonts/` and add matching `@font-face` rules at the top of `css/styles.css`.
