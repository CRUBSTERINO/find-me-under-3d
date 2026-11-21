# Hackathon tasks

Answer these questions using the simulator and your own research. Where the two disagree, explain why. The same list opens from the "Tasks" button in the simulator.

1. **Which tools make up a rescuer's standard kit? What do teams use today?**
   - Simulator: open "Compare tools", then play levels 5 and 6, where you buy a kit on a budget.
   - Research: INSARAG equipment lists, real devices and prices (Delsar, SearchCam, LifeLocator), what THW, FEMA and others carry.
2. **Which factors do you have to take into account? Is it possible to save everyone at all?**
   - Simulator: change noise, day or night and hours since collapse. Look for the "No tool here would detect" line in the debrief.
   - Research: survival curves for buried people, the first 72 hours, building types and collapse patterns.
3. **What did rescuers lack in real operations, for example in Ukraine or Turkey?**
   - Simulator: find the situations where every tool fails and check whether the same gaps show up in the reports.
   - Research: after-action reports and interviews: Turkey 2023, strikes on residential buildings in Ukraine, Surfside 2021 and others.
4. **Brainstorm ways to solve the current problems.** Gap analysis: what could cheap hardware replace (a smartphone, Raspberry Pi, microphones, ESP32, Wi-Fi CSI, a drone with a thermal camera, mmWave radar for tens or hundreds of dollars)? Where does physics stop you?
   - Simulator: describe your device with the same parameters as the tools in `js/config.js`: what it measures, range, time, price. Which hidden people would it reach?
   - Research: datasheets and papers on low-cost sensing, signal loss through concrete, open projects that already exist.
5. **Can algorithms or machine learning make the search faster or more accurate? What are the options?**
   - Simulator: use the test log and the debrief to see which order of tools found people and which led to false marks.
   - Research: sensor fusion, search planning, signal classification, drone path planning, published results and their limits.
6. **Which other challenges are missing from the simulation? What does it simplify?**
   - Simulator: read the "Simplifications" part of the README and `docs/realism.md`, then find a case where the model is wrong.
   - Research: secondary collapse, coordinating several teams, triage, broken mobile networks, extraction.

---

## More questions (optional)

Answer each question in two ways: with an experiment in the simulation (what you did and what you saw) and with research (sources, interviews, data). Where the two answers disagree, explain why. The explanation is worth as much as the answer.

### 1. What should a rescue team's kit contain on a limited budget?
- Simulation: levels 5 and 6 (buying a kit). Play 3 or 4 variants (`&v=`) and compare your kit with the best ones in the debrief. Does the best kit change from one variant to another?
- Research: INSARAG equipment standards for light, medium and heavy teams; prices of real devices (Delsar, SearchCam, LifeLocator and others); what teams such as EMERCOM (Russia), THW and FEMA carry.

### 2. Which tool cannot be replaced, and which one duplicates others?
- Simulation: the debrief has an "only this: …" line for each tool. Collect it across all levels and variants. Which tool is most often the only one?
- Research: operation reports (Turkey 2023, Surfside 2021, Mexico City 2017). What actually found people?

### 3. Where are the main bottlenecks of search technology?
- Simulation: find the people nobody can detect (the "No tool here would detect" line). What do they have in common: depth, slabs, consciousness, a phone?
- Research: what the devices cannot do (concrete, noise, battery, network, accuracy). Which limits come from physics, and which are engineering limits that could be removed?

### 4. A signal does not give you the place. How do you get from a detection to a precise spot to dig?
- Simulation: compare how many people you detected (the "Signal" column) with how many you marked correctly. Which sequence of tools gets you to ±2 m fastest?
- Research: how USAR teams confirm a find (INSARAG: confirmed and potential finds, re-checks by a dog and by devices).

### 5. How does noise on site change search tactics?
- Simulation: level 2 against level 1. Which tools lose almost nothing in noise? In the sandbox, is it worth stopping the machinery, and for how long?
- Research: quiet periods in real operations. Who calls them, how often, how much time they cost, and what they cost the rubble removal work.

### 6. How does the best strategy change with time after the collapse?
- Simulation: the sandbox "hours since collapse" slider from 2 to 96 h. When do the geophone (people stop tapping), the phones (batteries) and the thermal camera stop working?
- Research: survival data for buried people (88 %, 35 % and 9 % over the first three days in the Philippines in 1990) and the "golden 72 hours".

### 7. How does the building type decide the choice of tools?
- Simulation: the same conditions in the sandbox for the panel, brick and frame building. Where do the dog and the geophone work better, where the radar, and where can you not do without access (a shaft, an opening)?
- Research: collapse types (pancake, lean-to, V-shape), the voids each one leaves, and statistics on building types in a region.

### 8. How do you get the camera to a person?
- Simulation: in levels the openings are hidden. Count how much team time you spent finding a way in (dog, drone, blind probes) compared with looking through the camera. Which tool gave you the openings that led to someone?
- Research: how teams make access when there is no gap (inspection holes with a core bit, breaching a slab): diameter, time, risk of secondary collapse, and the rules for assessing a structure before cutting into it. The simulation does not model this; estimate what it would add.

### 9. Why do teams place false marks, and how can they avoid them?
- Simulation: collect all your team's false marks. Which tool led to each one: a neighbour's phone, scent near the crowd, a false radar target, a warm spot by day?
- Research: what a false alarm costs in a real operation (hours of a squad's work, risk) and the protocols for re-checking.

### 10. Which existing or new solutions would close the gaps you found?
- Simulation: pick a bottleneck from questions 2 and 3. Describe a new "tool" by its parameters in `js/config.js`: what it measures, its range, time and price. Which people in the levels would become detectable?
- Research: what already exists or is being tested: drones acting as a cellular base station (SARDO, MOBNET), long-range radars (FINDER), snake robots, CO₂ sensors, whistle apps (Turkey 2023). How ready are they for the field, and what do they cost?

---

If there is time left:
- How should several teams work on one site? What is missing in the simulation to model it?
- How truthful is the simulation itself? Find a parameter in `js/config.js` that disagrees with the data and justify a new value (see `docs/realism.md`).
