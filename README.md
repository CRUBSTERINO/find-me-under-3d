# Find Me Under: 3D search tool lab

A 3D model of three collapsed buildings. Participants deploy six search tools, see what each one returns, and change the noise, time of day and hours since the collapse to see how the readings change. There are no points. The levels end in a debrief that compares your marks with where the people really are.

This project is separate from the 2D planning prototype in `../challenge` and does not touch it.

## Hackathon tasks

Teams answer six questions, using the simulator and their own research: the standard kit, the limits of search, what was missing in real operations, cheap hardware and physics, algorithms and ML, and what the model leaves out. The list opens from the "Tasks" button in the top bar and is also in [docs/hackathon-questions.md](docs/hackathon-questions.md), with optional deeper questions.

## Run

Open `index.html` in Chrome, Firefox or Edge. It works straight from disk (`file://`), with no install, no build step and no internet. three.js is bundled in `lib/`.

If a browser blocks local files, serve the folder instead:

```bash
python3 -m http.server 8767 --directory sim3d
```

and open <http://localhost:8767>.

## Two modes

The sandbox (the default) has one building and all tools, and you can change the conditions freely. Open Levels in the header to switch the sandbox to another building:

- 9-storey RC panel block (pancake collapse, neighbours on both sides)
- 5-storey brick block (a big mound of brick rubble with a few slabs and a lean-to void)
- RC frame office with a basement shelter (thick 0.3 m slabs, a lean-to over the ground floor, an emergency shaft down to the basement)

A level is a building with fixed conditions and a team-time budget. Each test costs time (set in `CONFIG.costs`), and some tools may be unavailable. The participant decides which tools to use, then presses Finish and debrief.

| Tool | What it is needed for |
|---|---|
| Phone detector | the deep, silent person with a live phone, whom nothing else may reach |
| Radar | silent people under loose rubble; it gives range only, so it needs several positions to localise |
| Geophone | cheap, quick screening for people who can still tap; gives a bearing |
| Dog | fast screening of a wide area; reveals gaps (scent exits) for the camera; points at exits, not at people |
| Thermal drone | overview of the whole site; at night it finds gaps (warm air) and people right at the surface; weak by day |
| Camera | the only exact position and the person's condition; needs a gap |

## Using it

1. Pick a tool with the buttons on the left, or press keys 1 to 6.
2. Click on the rubble to deploy it. In the sandbox the camera needs a blue opening ring; the rings appear when the camera is selected.
3. Read the result on the right. If you change conditions in the bottom bar, the open result updates. Releasing a slider adds a "retest" entry to the log.

| Control | Action |
|---|---|
| Left drag | rotate |
| Right drag / Shift+drag | pan |
| Wheel / touchpad pinch | zoom |
| 1-6, Esc | pick tool, deselect |
| R, X | reset view, X-ray |
| M | mark mode (levels) |
| ← → ↑ ↓, + / − | steer the camera probe and change its length |

Every test stays in the scene as a numbered marker and in the test log. Clicking a log entry flies the view to that marker and reopens the result under the conditions of that test. "Recompute now" switches the result back to the current conditions.

The eye button at the top right turns on teacher mode. It shows the hidden people with their condition and phone battery, adds a "Why" box to each result (for example "P3: 1.3 m, slabs 1.0, rubble 0.0 m → S/N 22 dB") and ticks the log entries that found a real person. It is off by default.

No tool finds everyone. These results are for noise 30 %, day, 6 h (grid search); other conditions shift them.

## Simplifications

- Paths are straight lines. Real sound and radio waves also travel along slabs and through voids around obstacles.
- Losses are fixed per slab and per metre. There is no frequency dependence, moisture, rebar density or multipath.
- The thermal image is computed from the physics model (surfaces and heat sources), not rendered optically. There is no wind.
- Scent has no wind either; it leaves the rubble only at the exits listed above.
- The camera probe steers in a simplified way. A real telescopic probe slides worse, and a long flexible endoscope is much harder to steer.
- Victim conditions are simple time thresholds. Nobody dies in the model.
- All numbers are teaching approximations, chosen to be plausible and to show the right qualitative behaviour. The theory team should check them in `js/config.js`.

## Technical notes

- three.js r158 (`lib/three.min.js`, the last version with a classic, non-module build), loaded with plain `<script>` tags so `file://` works. MIT licence in `lib/three.LICENSE`.
- The orbit controls are a small custom file, so no extra library is needed.
- About 130 draw calls and 65k triangles, light enough for an ordinary laptop.
