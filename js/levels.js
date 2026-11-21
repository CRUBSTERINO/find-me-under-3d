window.SIM = window.SIM || {};
SIM.LEVELS = [
  {
    id: 'L1', scenario: 'panel9', cond: { noise: 0.1, night: true, hours: 8 }, budgetH: 4,
    title: 'A quiet night at the panel block',
    brief: 'A section of a 9-storey panel block collapsed. It is night, 8 hours after the collapse, and the machinery has stopped, so the site is quiet. All tools are available.',
    task: 'Mark 📍 as many people as you can within 4 hours. Avoid false marks: each one sends a squad digging in the wrong place.',
    lesson: 'Even in ideal conditions no tool finds everyone, and a signal does not tell you where to dig. Radar gives range only, so you need 2 or 3 positions to cross the rings. The geophone narrows the direction. The dog shows where scent comes out, which is often a gap the camera can then go into to confirm.'
  },
  {
    id: 'L2', scenario: 'panel9', cond: { noise: 0.85, night: false, hours: 30 }, budgetH: 4,
    title: 'Noisy day: a crane holds a slab',
    brief: 'Same building, on the second day. A crane is holding an overhanging slab, so the machinery cannot be stopped. It is sunny. Some people are weaker now and some phones are dead.',
    task: 'Which tools still work here at all? Detect people within 4 hours.',
    lesson: 'With the machinery running, the geophone and radar miss most people, and the radar starts showing false targets. The dog, phone detector and camera still work, with their own traps: the dog picks up scent from the crowd of rescuers, and the detector sees the phones of neighbours and rescuers. Most false marks in this level come from noise.'
  },
  {
    id: 'L3', scenario: 'masonry5', cond: { noise: 0.3, night: false, hours: 2 }, budgetH: 3,
    locked: { radar: 'price', thermal: 'airspace' },
    title: 'Brick block, the first hours',
    brief: 'A 5-storey brick block collapsed into a big mound of bricks with few concrete slabs. It is daytime, 2 hours after the collapse. The local team has no radar, and drone flights are banned (air-raid alert).',
    task: 'Detect people with what you have. The debrief shows what the radar and drone would have added.',
    lesson: 'In loose brick the dog, geophone and phones cover most people without radar or drone. Check under "What if" whether the expensive radar would have added anyone in your variant. Usually that is an unconscious person without a phone under slabs, and even then the radar would only give their range.'
  },
  {
    id: 'L4', scenario: 'frame4', cond: { noise: 0.2, night: true, hours: 72 }, budgetH: 4,
    locked: { dog: 'busy' },
    title: 'Basement shelter, day three',
    brief: 'An RC frame building with thick slabs. People sheltered in the basement and the upper floors collapsed on top of it. It is night, 72 hours after the collapse. Dog teams are busy at another site.',
    task: 'How do you reach the basement? Detect people within 4 hours.',
    lesson: 'Almost nothing gets through the thick slabs from above, so this level is about access. Find the shaft (the clue is a hatch on the ground), go in with the camera and put the radar next to it. People the camera sees are marked automatically; the rest you have to place from the radar and phone readings.'
  },
  {
    id: 'L5', scenario: 'frame4', cond: { noise: 0.4, night: false, hours: 12 }, budgetH: 4,
    shop: { budget: 5 },
    title: 'Build your kit: budget 5',
    brief: 'RC frame building, daytime, 12 hours after the collapse. The team has a budget of 5 units. Prices: geophone 1, dog 1, camera 2, phones 2, drone 2, radar 3.',
    task: 'Choose a kit, then search. The debrief shows the best kits for this situation.',
    lesson: 'The best kits combine tools that cover each other\'s gaps: something for conscious people, something for silent ones, and something for access and confirmation. Price matters less.'
  },
  {
    id: 'L6', scenario: 'masonry5', cond: { noise: 0.6, night: true, hours: 20 }, budgetH: 3,
    shop: { budget: 4 },
    title: 'Poor team at night: budget 4',
    brief: 'Brick block at night, 20 hours after the collapse. Generators and floodlights are noisy. The budget is only 4 units.',
    task: 'What do you buy with this budget? Search and compare with the best kits.',
    lesson: 'Compare your kit with the best ones. Two cheap tools that cover each other\'s gaps often find as many people as one expensive tool. Noise hurts the geophone and radar but not the dog. At night the drone mostly finds gaps and people right at the surface.'
  }
];
