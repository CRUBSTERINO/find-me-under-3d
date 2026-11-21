# Find Me Under: 3D search tool lab

A 3D model of three collapsed buildings. Participants deploy six search tools, see what each one returns, and change the noise, time of day and hours since the collapse to see how the readings change. There are no points. The levels end in a debrief that compares your marks with where the people really are.

This project is separate from the 2D planning prototype in `../challenge` and does not touch it.

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

| # | Building | Conditions | Twist |
|---|---|---|---|
| 1 | panel | night, quiet, 8 h | all tools, learn them |
| 2 | panel | day, 85 % noise, 30 h | the crane cannot stop |
| 3 | brick | day, 2 h | no radar (price), no drone (airspace closed) |
| 4 | frame + basement | night, 72 h | no dog teams; find the shaft (hatch on the ground) |
| 5 | frame + basement | day, 12 h | buy a kit with budget 5 |
| 6 | brick | night, 60 % noise, 20 h | buy a kit with budget 4 |

### What makes a level hard

These rules make a team interpret the signals instead of clicking where the answer is:

- Marks decide the result. The team places up to 8 marks (📍, key M) where they think people are. The debrief counts a person as found only if a mark lies within 2 m of them, and reports each false mark as about 3 h of a rescue squad digging for nothing. A radar ring, a geophone bearing or a dog alert only says someone is around. To mark correctly, the team has to cross radar rings from 2 or 3 positions or combine bearings. A person seen on the camera is marked automatically (green ✓) at their exact position, and these marks do not count toward the 8.
- The team has to find camera access. Levels do not show the openings. A gap becomes known (its ring appears) when the dog works at it because scent comes out there, when the thermal image shows warm air leaking from it (mostly at night), or when someone probes blindly within 1 m of it (a miss costs 0.1 h).
- Each level has variants. The people, their condition, their phones and whether they are there at all depend on a variant number, shown in the briefing and the header and kept in the URL as `&v=1234`. The briefing gives only a range ("between 5 and 7 people"). To make all teams search the same variant, give them the same link, e.g. `#level=L3&v=4821`.
- X-ray, teacher mode and "clear tests" stay disabled until the debrief. Instructors can add `&teacher` to the URL to keep them.
- Time is short. A radar scan costs 0.5 h because the whole site has to stop and stand still, and the camera 0.5 h, out of 3 to 4 h.

The debrief is computed from the same tool models, with nothing scripted. It shows:

- correct marks, false and duplicate marks (with the nearest person and distance), and people your tools had a signal from but you did not mark;
- for every person: where they are, their condition and phone, your mark, which of your tests had a signal from them, and which tools could have had one;
- for every tool: how many people it could detect in this situation, and which ones only this tool could detect. "Could" means the tool was tried on a 1.5 m grid over the site. The camera is tried at every opening with several lengths and head angles, the drone with overlapping footprints;
- under "What if", for every unavailable tool, the people it would have detected that no available tool finds;
- in shop levels, the best kits within the budget (all combinations), compared with yours;
- a short takeaway for the level, kept general because the variant changes the details.

### How much the tools overlap

Measured with the grid search before the radar was weakened (0.5 h per scan, 14 dB per slab):

| Level | Geophone | Radar | Dog | Phone | Thermal | Camera |
|---|---|---|---|---|---|---|
| L1 | P1 P3 P5 P6 P7 | P1 P3 P5 P6 P7 | P3 P4 P5 P6 | P1 **P2** P6 | P3 P6 | P3 P4 |
| L2 | P3 P6 | P3 P5 P6 P7 | P3 P4 P6 | **P1** P6 | none | P3 P4 |
| L3 | M1 M3 M4 | M1 M3 M4 M5 | M1 M3 M5 | M1 M4 M5 | none | M1 |
| L4 | B1 B2 | B1 B2 F1 F2 F3 | B1 B2 F1 F3 | **B3** F2 | F3 | B1 F1 |

Bold marks a person only that tool finds. The radar covered everything the geophone did, the thermal drone never found anyone the others missed, and only the phone detector was regularly the only way to reach someone. Detection alone was too easy, which is why marks, hidden openings and variants were added. Each tool now has its own job:

| Tool | What it is needed for |
|---|---|
| Phone detector | the deep, silent person with a live phone, whom nothing else may reach |
| Radar | silent people under loose rubble; it gives range only, so it needs several positions to localise |
| Geophone | cheap, quick screening for people who can still tap; gives a bearing |
| Dog | fast screening of a wide area; reveals gaps (scent exits) for the camera; points at exits, not at people |
| Thermal drone | overview of the whole site; at night it finds gaps (warm air) and people right at the surface; weak by day |
| Camera | the only exact position and the person's condition; needs a gap |

## For organisers

- [`docs/realism.md`](docs/realism.md) compares each tool model with published data, lists what is missing, and records the parameter changes made after the check.
- [`docs/hackathon-questions.md`](docs/hackathon-questions.md) has ten questions to answer both in the simulation and through research.

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

## Files

| File | What is in it | Who edits it |
|---|---|---|
| `js/config.js` | All tool parameters (dB losses, ranges, thresholds, temperatures, dog fatigue…) and the starting conditions | theory team |
| `js/texts.js` | All UI text, including the tool cards and the Compare table | theory team |
| `js/scenarios/*.js` | One file per building: footprint, slab levels, voids, walls, rubble, leaning panels, debris piles, openings, hidden people, other phones on site, vehicles | anyone |
| `js/levels.js` | The levels: building, fixed conditions, time budget, locked tools or shop budget, texts (brief, task, takeaway) | theory team |
| `js/scenario.js` | Builder that turns building data into boxes; random variants | |
| `js/analysis.js` | Debrief: what each tool could detect, your detections, best kits | |
| `js/levels-ui.js` | Level menu, briefing and kit shop, time HUD, person marks, debrief window | |
| `js/access.js` | Camera access: which openings are known, discovery by dog, drone or blind probing | |
| `js/physics.js` | Geometry queries shared by all tools: what lies on a line (concrete, rubble, air), surface height, a person's condition after *h* hours, where scent and heat can leave the rubble | |
| `js/tools/*.js` | One file per tool: `deploy`, `evaluate`, `render` (the output panel), `marker` (3D marker) | |
| `js/scene.js` | 3D visuals: building, debris, neighbours, people, probe camera view | |
| `js/ui.js`, `js/main.js`, `js/controls.js`, `js/widgets.js`, `js/util.js` | panels, log, compare table, picking, orbit controls, small helpers | |

### Change a tool
Edit its block in `js/config.js` (numbers) and `js/texts.js` (texts). The code reads them every time it evaluates, so a reload is enough.

### Add a tool
1. Copy a tool file in `js/tools/` (for example `radar.js`), give it a new `id` and colour, and write `evaluate(dep, cond)` using `S.phys.path(a, b)`, `S.phys.victimState(v, hours)` and `S.phys.surfaceAt(x, z)`.
2. Add a `<script>` line for it in `index.html` (the order sets the number key).
3. Add `tools.<id>` texts (name, short, returns, pros, cons, how, cmp) in `js/texts.js`, an icon in `S.icons` (`js/util.js`), and parameters in `js/config.js`.

`evaluate` returns `{ summary, found, why, … }`. `summary` and `why` are `{k, p}` text keys that are filled in when the result is shown.

### Add a level
Add an object to `SIM.LEVELS` in `js/levels.js`. `locked: { radar: 'price' }` takes a tool away (the reasons are in `texts.js` under `lvl.reason`). `shop: { budget: 5 }` turns the briefing into a kit shop. `variant: false` keeps the people exactly as in the building file, with no random variants. Run the level once and read the debrief before writing the takeaway, so the text says what the model actually shows.

### Change or add a building
Copy a file in `js/scenarios/`, give it a new `id`, and add a `<script>` line in `index.html`. It then appears in the menu as a sandbox and levels can use it. `hx` and `hz` are the half-sizes of the footprint. `piles` sets the debris height and width on each side (`front`, `back`, `left`, `right`). `basementY` makes the space below ground inside the footprint a room rather than soil. Levels are listed bottom to top, each with the void height below it, an offset and slab pieces with small tilts. Walls, rubble and victims are attached to a void (`gap`), so their heights are computed automatically. Openings, decoy phones and site props are plain coordinates in metres (x along the building, y up, z towards the street).

## How each tool is modelled

All tools share one model. A straight line from the sensor to a person is sampled every 4 cm and classified as concrete (slabs, wall panels), rubble (loose debris boxes and the debris piles), soil (below ground, outside a basement) or air (voids). Soil has its own loss per tool: it carries vibration fairly well, absorbs radar strongly and almost stops scent. Every slab the line crosses counts as one "slab", and long grazing runs through concrete add a little more. People change with time, going from conscious to weakening to unconscious at their own hours, and phone batteries drain every hour.

| Tool | Model | What participants can learn from it |
|---|---|---|
| Geophone | Tap level − 20 log(distance) − 10 dB per slab − 6 dB/m rubble, compared with background noise (15 dB + 45 dB × machinery noise, −5 dB at night). The operator recognises the rhythm above 6 dB S/N. The bearing to the loudest source has an error that grows as S/N falls. Settling clicks fade over the first hours. Output: scrolling seismogram, synthesised audio, bearing wedge. | Machinery masks everything. Slabs block sound and rubble much less. Unconscious people are silent. A sensor at the side of the stack can hear someone the top cannot. |
| Camera | A semi-flexible probe, up to 3 m, pushed in from a real opening (in levels the openings must be found first, see above). Turning the head only turns the view; the tip stays where it is. Each 0.2 m pushed steers toward where the head pointed at that moment (up to 150° per metre), and when the probe meets an obstacle it bends off it (up to 85° per 5 cm step), so it can follow a void along its floor. Where the void allows it, the tip keeps 6 cm from walls so the view never ends up inside them. It stops when no direction is free or when it touches a person. A second renderer draws the view, lit only by the LED (about 3.2 m range). | It needs an opening and a clear path behind it. It is the only tool that shows the person and their condition. Its reach is short. |
| Radar | Two-way loss: 14 dB per slab each way (rebar mesh), 3 dB/m rubble each way, 40 log(distance). Movement (conscious) is stronger than breathing alone. Machinery vibration raises the noise floor and creates unstable false targets. Range only, up to 7 m. | It finds unconscious, silent people through loose rubble, but not under several slabs. It gives no direction, so you measure from 2 or 3 points and intersect the circles. |
| Phone detector | RSSI = 21 dBm − (40 + 22 log d) − 6 dB per slab − 1.5 dB/m rubble. The distance estimate inverts the open-air formula. Rescuers' and neighbours' phones appear on the list too. | It finds silent and unconscious people, but only while the battery lasts (hours slider). Buried phones look tens or hundreds of metres away, so you find them by following the strongest signal instead of trusting the distance. |
| Thermal drone | Per pixel: the material and orientation of the top surface, plus air temperature, plus sun heating by day (depends on material and angle). Heat reaches the surface through thin rubble cover (e-folding 0.15 m) or as warm air out of an opening connected to the person's void. There is also a smouldering spot that cools over hours, engines (∝ noise), exposed rescuers and the warm building interior at night. Auto-ranged "inferno" palette with a warm-spot counter. | It sees surfaces and cannot see through concrete. By day sun-heated debris creates dozens of warm spots, at night only a few. A fire or an engine compresses the colour range. |
| Search dog | Scent strength from each person to each exit (straight up, openings, facade edges): × 0.15 per slab, e^(−rubble/1.4 m), e^(−air/6 m), e^(−soil/0.3 m), weighted by whether the exit is inside the 6 m search circle. Above 0.07 an exit gives interest (sniffing, circling), above 0.2 an alert (barking, digging). Output: the dog's search track and lettered reaction spots with strength, direction and confidence. Efficiency drops with fatigue (+15 % per search; "rest" resets it), by day, with noise and crowding, and in the first hours. | It is fast and finds unconscious people near the surface. It indicates where scent comes out (often an opening, sometimes several places for one person) rather than where the person lies, and it says nothing about depth. It tires, and crowds can give false interest. |

## Hidden people (spoilers for organisers)

The debrief of each level lists all people and which tools could find them. The table below is for the panel block sandbox; levels use variants, so the people there can differ.

| | Where | Condition | Phone | Found by |
|---|---|---|---|---|
| P1 | ground-floor void, under 8 slabs | conscious, weak at 30 h, unconscious at 60 h | 70 %, lasts ~78 h | phone; geophone and radar only from the low front pile (x −2 to 0), through the collapsed front wall |
| P2 | void 4, centre | unconscious | 30 %, dies ~21 h | phone in the first day; radar only from one spot on the rear pile |
| P3 | top void under cracked roof | conscious until 48 h | none | geophone, radar, camera (O4 crack, O7), dog, thermal at night |
| P4 | void 6, 1 m behind front opening O1 | unconscious | broken | camera (O1), dog, thermal plume at night. Radar and geophone miss them |
| P5 | lean-to pocket in rear debris pile | conscious, weak at 4 h, unconscious at 12 h | 15 %, dies ~8 h | radar and geophone from the rear pile (geophone only while conscious), phone in the first ~8 h. The dog rarely alerts (1.3 m rubble) |
| P6 | shallow pocket in front-right pile | conscious | 80 %, lasts ~89 h | almost everything; an easy case |
| P7 | void 2 at front-left edge | conscious until 36 h | none | geophone or radar placed on the front-left pile, never from the top. Dog and thermal miss them |

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
