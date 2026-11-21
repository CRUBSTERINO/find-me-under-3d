# How realistic the simulation is

This compares the tool models with open sources (November 2026). The numbers in the simulation are teaching approximations. What should match reality is how the tools compare with each other and where each one fails. The exact values of any particular device are not modelled.

In short, the model behaves much like USAR practice. The main simplifications:

- there are no deceased people; everyone is alive;
- there is one team instead of several;
- nothing collapses further while the team works;
- materials and the radio environment are idealised.

There is almost no public quantitative data on how well each tool performs in real operations (how many people each one found). That gap is itself a question for the hackathon.

## Tool by tool

| Tool | In the simulation | What the sources say | Verdict |
|---|---|---|---|
| Search camera | A semi-flexible probe up to 3 m. The head turns, and when pushed the probe goes where the head points. LED light reaches about 3.2 m. Needs an existing opening; the simulation has no drilling or breaching. | Professional kits have a telescopic pole with a head that turns 180-240° and LED light. The Recon III, for example, is about 1.1-1.4 m long, with extensions and an IR head ([DHS camera review](https://dhs.gov/sites/default/files/publications/SearchCameras-SUM_0710-508.pdf), [Con-Space](https://thebigredguide.com/con-space-communications-searchcam-3000-technical-details.html), [Recon III](https://www.thebigredguide.com/datasheets/con-space-communications-searchcam-recon-iii/co-272-ga/reconIII_brochure_final.pdf)). Teams put the camera in through inspection holes cut with a core bit ([Fire Engineering](https://www.fireengineering.com/firefighter-training/training-notebook-cutting-concrete-floors/)). | Close. Length cut from 4 m to 3 m. A real rigid telescope slides worse than our probe. Flexible endoscopes can be longer but are hard to steer. |
| Breathing and heartbeat radar | Gives only a distance, up to 7 m, with no direction. Large losses in reinforced slabs, false targets from machinery vibration. A scan costs 0.5 h because the whole site has to freeze. | The LifeLocator maker claims about 4.6 m for breathing and 6.4 m for movement ([review](https://core.ac.uk/download/322391407.pdf)). FINDER (NASA JPL and DHS) found a person under 9 m of mixed rubble in trials ([JPL](https://www.jpl.nasa.gov/news/new-technology-can-detect-heartbeats-in-rubble/)). Movement on the surface and radio traffic cause false alarms and lower the sensitivity ([Sensoft](https://sensoft.ca/case-studies/buried-victim-search-rescue/)). | Close. Range cut from 9 m to 7 m. Interference from the team's own radios is not modelled yet. |
| Acoustic and seismic sensor (geophone) | One sensor: tapping over noise and a direction with an error. Slabs damp the signal, loose rubble less. | The Delsar LD3 takes up to 6 seismic and 2 acoustic sensors, 1-3000 Hz. Teams use them during quiet periods and locate the source by comparing levels between sensors. The acoustic sensor also allows two-way talk ([Savox/Delsar](https://www.firehouse.com/rescue/technical-rescue/structural-collapse/product/10181928/con-space-communications-delsar-life-detector)). | Simplified. Real teams lay out a network of sensors and locate the source by comparing levels; there is no direction arrow. The model has no voice contact with the person. The maker does not publish a range. |
| Phone detector | Signal strength from a phone. Distance is computed with the open-air formula, so under rubble it comes out far too large. Neighbours' and rescuers' phones show up too. Batteries run down. | Drone-based systems report accuracy from 1-2 m (the authors' claim, [IEEE Access 2020](https://doaj.org/article/5240bc4e0bda4ee69332422fda2c018c)) to about 10 m (MOBNET, [CORDIS](https://cordis.europa.eu/article/id/238596-search-and-rescue-drone)) and tens of metres (SARDO, [IEEE Spectrum](https://spectrum.ieee.org/tech-talk/robotics/drones/searchandrescue-drone-locates-victims-by-homing-in-on-their-phones)). According to THW, about 80 % of buried people had their phone on them ([master's thesis, AAU](https://projekter.aau.dk/projekter/files/213387349/master.pdf)). | The idea is right. The model ignores that cellular networks often go down in an earthquake ([Kahramanmaraş 2023](https://hazards.colorado.edu/quick-response-report/communication-and-coordination-networks-in-the-2023-kahramanmaras-earthquakes)). A detector then needs its own base station, or the phone never transmits. |
| Thermal camera (drone) | Sees only the surface: thin debris cover, warm air from gaps, fire, machinery. By day the sun creates many false spots. | Sources confirm that thermal imaging works in the dark, while dust and other heat sources (fire, machinery, animals) get in the way ([ICAS 2024](https://www.icas.org/icas_archive/icas2024/data/papers/icas2024_1093_paper.pdf)). No study turned up in which a thermal camera saw through a thick layer of rubble. | Close. It is a tool for surveying the site, not for searching deep. |
| Search dog | Reacts where scent comes out, which is not always above the person. Tires, works worse by day and in noise, and a crowd causes false interest. | Under INSARAG rules a dog signals a live find with at least three barks at one spot, and the alert is checked by another dog or by a device ([NIST SWGDOG](https://www.nist.gov/document/swgdoghumanscentdogs-searchingforlivepeopleindisasterenvironmentspdf), [IRO](https://www.iro-dogs.org/fileadmin/user_upload/Downloads/Guidelines_International_IRO_MRT_Rubble.pdf)). A Czech study of deployments in 2006-2017 found no live people, and 56 % of searches had fewer than the recommended three dog teams ([UJEP](https://kj.list.ujep.cz/wp-content/uploads/2026/03/part-cynology-teams-kj-aj-2019.pdf)). | Close. The required re-check by a second dog is not modelled. Neither are dogs trained on the deceased (HRD), since everyone in the model is alive. |

## Which level rules match practice

- Marks instead of signals. INSARAG separates a confirmed find (seen, heard or touched) from a potential one (a dog or device signal) ([INSARAG, vol. III](https://insarag.org/wp-content/uploads/2021/09/INSARAG20Guidelines20Vol20III.pdf)). The simulation works the same way: a signal does not give the place, and only the camera confirms.
- Time is expensive. Survival of buried people drops fast. In the Philippines in 1990 it was 88 % on the first day, 35 % on the second and 9 % on the third. In Armenia in 1988, 89 % of those rescued alive were pulled out within the first 24 h ([Prehospital and Disaster Medicine](https://cambridge.org/core/journals/prehospital-and-disaster-medicine/article/surviving-collapsed-structure-entrapment-after-earthquakes-a-timetorescue-analysis/D24F04BFBA9EDA264EA11010418B09B5)). Hence the time budget and the cost of a false mark.
- Methods are combined. Heavy USAR teams are required to combine canine and technical search ([Canada, USAR standard](https://www.publicsafety.gc.ca/cnt/rsrcs/pblctns/usar-tm-stndrds/index-en.aspx)). The overlap analysis in the simulation agrees: no single tool finds everyone.

## What the simulation lacks (for later)

1. Deceased people, prioritising victims (triage) and extraction. The model ends at the mark.
2. Several teams, coordination and handing over a site. In Turkey in 2023 this was the main bottleneck of the first three days ([Bull. Earthquake Eng.](https://link.springer.com/article/10.1007/s10518-024-01867-3)).
3. Secondary collapses and risks to rescuers.
4. Making access: drilling inspection holes and breaching slabs. In reality teams core-drill a 5-10 cm hole for the camera and must assess the slab first ([Fire Engineering](https://www.fireengineering.com/firefighter-training/training-notebook-cutting-concrete-floors/), [FEMA, module 3](https://webarchive.library.unt.edu/eot2008/20081025081227/http://www.fema.gov/pdf/emergency/usr/module3agen.pdf)). The simulation uses only openings that already exist.
5. A broken cellular network and interference from the team's own radios.
6. Voice contact with the person (call out and listen), which in reality is the first search method.
7. People dying over time. Today a person weakens but stays alive.

## What changed in the model after the check

| Parameter | Before | After | Why |
|---|---|---|---|
| Radar range | 9 m | 7 m | The LifeLocator maker claims 4.6-6.4 m |
| Camera probe length | 4 m | 3 m | Telescopic kits with extensions |
| Probe model | rigid, straight only | semi-flexible, follows the head and slides off obstacles | The probe stopped right after entering an opening |
| Head control | turning the head re-routed the whole probe | turning only turns the view; each push follows the head; 6 cm clearance from walls | The view swung into walls when the head turned |
| Drilling for the camera | 1 h per hole | removed | Gameplay: it let teams skip finding access; still listed above as a gap |

Most sources with numbers are manufacturer data or trials, and there are few independent field estimates. Treat the values in `js/config.js` as a starting point for discussion rather than measurements.
