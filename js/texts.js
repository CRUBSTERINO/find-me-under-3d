window.SIM = window.SIM || {};
SIM.TEXT = {
  en: {
    app: { title: 'Search under rubble: 3D tool lab', short: '3D search lab' },
    hint: {
      s1: 'Choose a tool (buttons on the left, or keys 1 to 6)',
      s2: 'Click on the rubble to deploy it',
      s3: 'Read the result on the right and try other conditions',
      nav: 'Mouse: rotate, right/Shift: pan, wheel: zoom',
      ok: 'Got it'
    },
    ui: {
      tools: 'Tools', result: 'Result', log: 'Test log', noTests: 'No tests yet',
      noResult: 'Choose a tool and click in the scene',
      resetView: 'Reset view (R)', xray: 'X-ray: show slabs and voids (X)',
      debug: 'Teacher mode: show people and reasons', debugOn: 'TEACHER',
      compare: 'Compare tools', help: 'Hint',
      clear: 'Clear tests', clearConfirm: 'Delete all tests?',
      returns: 'Returns', pros: 'Pros', cons: 'Cons', how: 'How to use',
      close: 'Close', condAt: 'Test conditions', useNow: 'Recompute now',
      retest: 'retest', why: 'Why (teacher)', place: 'Place',
      deselect: 'Esc: deselect'
    },
    cond: {
      title: 'Conditions', noise: 'Machinery noise', day: 'Day', night: 'Night',
      hours: 'Hours since collapse', h: '{h} h', chip: 'noise {n}%, {dn}, {h} h'
    },
    zone: {
      top: 'Top of rubble', front: 'Front rubble', back: 'Rear rubble', side: 'Side rubble', neighbour: 'Neighbour building',
      ground: 'Site', opening: 'Opening {id}', at: '{zone} ({x}; {z})'
    },
    dir: { f: 'to front', fr: 'front-right', r: 'right', br: 'back-right', b: 'to back', bl: 'back-left', l: 'left', fl: 'front-left', below: 'almost below sensor' },
    state: { conscious: 'conscious', weak: 'weakening', unconscious: 'unconscious', phoneOn: 'phone {b}%', phoneOff: 'no phone/dead' },
    map: { front: 'front', back: 'back' },
    err: {
      noOpening: 'No opening here. The camera needs a gap (the blue rings).',
      noSurface: 'Click on the rubble surface',
      dogTired: 'The dog is tired. Let it rest first.'
    },
    acc: {
      blindNone: 'The probe found no gap here.',
      cancel: '',
      foundBlind: 'The probe found a gap: opening {id}',
      found: { dog: 'The dog worked at a gap: opening {id} found', thermal: 'Warm air is coming out of a gap: opening {id} found' }
    },
    geo: {
      listen: '🎧 Listen', stop: '■ Stop', level: 'Background {n} dB',
      tap: 'Rhythmic tapping: yes', noTap: 'No rhythmic tapping',
      masked: 'Tapping may be lost in noise',
      bearing: 'Loudest: {dir} (±{e}°)',
      settle: 'Single clicks: debris settling',
      sumTap: 'tapping, {dir}', sumNone: 'silence', sumMasked: 'noisy, unclear',
      snr: 'Signal/noise: {s} dB'
    },
    cam: {
      len: 'Length {l} / {m} m', bend: 'Head angle {a}°', blocked: 'The probe is stuck with no free path ahead. Turn the head toward open space and push again.', atPerson: 'The probe reached a person',
      seen: 'Person visible (~{d} m)', nothing: 'No person in view', sumSeen: 'person seen, {d} m',
      sumNothing: 'empty', sumBlocked: 'path blocked after {l} m', keys: '← → ↑ ↓ turn the head in place; + pushes the probe where the head points, − pulls it back',
      dark: 'Light ~{r} m'
    },
    radar: {
      profile: 'Range profile, m', breath: 'Breathing signal', det: '~{r} m, {kind}',
      kindMove: 'movement + breathing', kindBreath: 'breathing only', kindClutter: 'unstable (vibration?)',
      none: 'No signs of life detected', noDir: 'Direction: not available',
      rate: '{b} breaths/min', sum: '{n} target(s): {r} m', sumNone: 'nothing', vib: 'Machinery vibration interferes'
    },
    phone: {
      head: ['Device', 'Signal', 'Distance estimate'], none: 'No devices found',
      far: '> {m} m', est: '≈{d} m', sum: '{n} dev., strongest {s} dBm', sumNone: 'no devices',
      note: 'The estimate assumes only air between you', moving: 'moving'
    },
    thermal: {
      scale: '°C', front: '↓ front', air: 'Air {t} °C', hover: 'Hover for temperature',
      sum: '{n} warm spots, max {t} °C', alt: 'Altitude {a} m'
    },
    dog: {
      alert: 'ALERT', noAlert: 'No alert', conf: 'Confidence: {c}', confH: 'high', confM: 'medium', confL: 'low',
      dir: 'Indicates {dir}', depth: 'Depth: unknown', fatigue: 'Dog fatigue', rest: 'Let it rest',
      area: 'Searched radius {r} m', sum: 'alert ({c}), {dir}; spots: {n}', sumNone: 'no reaction', rested: 'The dog has rested',
      interest: 'INTEREST', sumInterest: 'interest at {n} spots, no alert', worked: '~{m} min work, alerts: {a}, interest: {i}',
      spotAlert: 'barks/digs', spotInt: 'sniffs, circles', spotAt: '{d} m {dir}', next: 'next search: {f}%'
    },
    why: {
      geo: '{id}: {d} m, slabs {s}, rubble {r} m → S/N {snr} dB',
      noTap: '{id}: not tapping ({st})',
      radar: '{id}: {d} m, slabs {s}, rubble {r} m → {snr} dB',
      radarOut: '{id}: beyond {m} m', notAlive: '{id}: no signal',
      phone: '{id}: true {d} m, slabs {s} → {rssi} dBm',
      phoneOff: '{id}: phone not working',
      cam: 'People in view: {ids}', camNone: 'Nobody in view',
      therm: '{id}: heat {t} °C at the exit point',
      thermNone: '{id}: heat does not reach the surface',
      dog: '{id}: scent {s}', dogNone: '{id}: no scent reaches the area'
    },
    lvl: {
      menu: 'Levels', sandbox: 'Sandbox', levelN: 'Level {n}', start: 'Start', brief: 'Briefing', finish: 'Finish and debrief',
      time: 'Team time: {u} / {t} h', noTime: 'Team time is used up. Finish the level.', available: 'Available', locked: 'Not available',
      reason: { price: 'Not in the team: too expensive', airspace: 'Flights banned: air-raid alert', busy: 'Dog teams busy at another site', kit: 'Not in your kit' },
      condFixed: 'Conditions are fixed by the level', shop: 'Buy a kit', budget: 'Budget: {u} of {b}', price: 'price {p}', perTest: '{h} h per test',
      task: 'Task', building: 'Building', conditions: 'Conditions', tools: 'Tools', pick: 'Choose a level or the free sandbox',
      sandboxDesc: 'Free experiments: all tools, conditions can change', overBudget: 'Over budget', emptyKit: 'Choose at least one tool',
      leave: 'Switch? Your current tests and marks will be lost.', budgetH: 'Team time: {h} h',
      hShort: 'h', mShort: 'm', rules: 'Rules', afterDebrief: 'Available after the debrief',
      residents: 'Neighbours say {a} to {b} people could have been in the section. Nobody knows for sure.',
      variant: 'Variant {v}. The people, their condition and their phones change from one variant to the next. To give all teams the same variant, open #level={id}&v={v}.',
      varShort: 'var. {v}',
      rule: {
        marks: 'Mark 📍 where you think people are (key M, up to {m} marks). The debrief only counts marks within {r} m of a person. A rescue squad loses about {h} h digging at each false mark.',
        openings: 'Nobody knows in advance where the camera openings are. A dog reacting at a gap or warm air on the thermal image gives one away. You can also probe blindly by clicking right next to a gap; a miss costs {b} h.',
        camera: 'A person you see on the camera is marked automatically (green ✓) at their exact position. These marks do not count toward the limit.',
        locked: 'X-ray, teacher mode and clearing tests open after the debrief.'
      }
    },
    mark: {
      btn: 'Mark a person {n}/{m}', tip: 'Mark mode (M): click to place, click a mark to remove it',
      added: 'Mark ?{n} placed', removed: 'Mark ?{n} removed', full: 'All {m} marks are used. Remove one first.', auto: 'Camera confirmed a person: mark ✓{n} placed (test #{t})', autoMoved: 'Camera confirmed a person: your mark ?{k} became ✓{n} (test #{t})', isAuto: 'Mark ✓{n} was confirmed by the camera and stays', camCell: '✓{n} camera (test #{t})'
    },
    deb: {
      title: 'Debrief: {t}', marked: 'Correctly marked: {f} of {n} people', falseN: 'False marks: {k}, about {h} h of rescue squad time wasted', falseNone: 'No false marks',
      used: 'Time: {u} of {t} h, tests: {k}, marks: {m}', signalNoMark: 'Your tools had a signal from {ids}, but there is no mark near them.', noMarks: 'You placed no marks, so the squad does not know where to dig.',
      falseTitle: 'False and extra marks', falseRow: 'Mark ?{n}: nobody within {r} m (nearest is {id}, {d} m).', dupRow: 'Mark ?{n}: extra, this person is already marked.',
      only: 'only this: {ids}', covNote: 'Worked out by trying each tool at every spot on the site and the camera at every opening.', kitNote: 'Coverage only says what a kit could detect. With any kit, people still have to be located and marked precisely.', again: 'Same variant again',
      people: 'People', tools: 'Tools in this situation', whatIf: 'What if…', kits: 'Best kits with budget {b}', lesson: 'Takeaway',
      cols: { person: 'Person', where: 'Where', state: 'State', mark: 'Your mark', yours: 'Signal in your tests', could: 'Could be detected by' },
      missed: 'not detected', where: '{zone}: {s} slabs and {r} m rubble above',
      zone: { stack: 'in the collapsed building', pile: 'in a debris pile', basement: 'in the basement' },
      could: 'could detect {n} of {t}', usedN: 'your tests: {n}', ifHad: 'With {tool}: +{ids} (nothing else finds them)',
      ifNothing: 'With {tool}: would detect {ids}, which the available tools already find', ifZero: 'With {tool}: would detect nobody here', phoneBroken: 'phone broken', nobody: 'No tool here would detect: {ids}',
      cont: 'Continue searching', other: 'Another level', show: 'Show people in the scene', analysing: 'Working out what each tool could have found…',
      phoneDead: 'phone dead', phoneNone: 'no phone', unavailable: 'not available', notInKit: 'not in kit', yourKit: 'your kit',
      kitRow: 'price {p}, detects {n} of {t}', note: 'A person counts as found if your mark is within {r} m. "Signal" means a tool picked up something from the person. The place still has to be worked out from it: radar gives only range, the geophone a direction, the dog the spot where scent comes out.'
    },
    tools: {
      geophone: {
        name: 'Acoustic geophone', short: 'Geophone',
        returns: 'Sound: tapping over noise and a rough direction',
        pros: ['Hears tapping through loose rubble', 'Listens to an area quickly'],
        cons: ['Needs silence; machinery masks it', 'Cannot hear unconscious people'],
        how: 'Place the sensors on the rubble, stop the machinery and listen for tapping.',
        cmp: { returns: 'Sound + direction', strengths: 'Tapping people, loose rubble', weaknesses: 'Noise, concrete slabs, unconscious', needs: 'Silence on site', time: '≈10 min/spot', cost: '€€' }
      },
      camera: {
        name: 'Search camera (probe)', short: 'Camera',
        returns: 'Live video from the tip of a probe in a gap',
        pros: ['Shows the person and their state', 'Confirms a find'],
        cons: ['Needs an opening and a clear path', 'Short reach: up to 3 m'],
        how: 'Click near a known opening (ring). The dog and the thermal drone give away unknown gaps, and a probe pushed in right next to a gap finds it too. Arrows turn the head in place; + pushes the probe the way the head points, − pulls it back.',
        cmp: { returns: 'Video from inside', strengths: 'Confirmation, condition', weaknesses: 'Needs access, short reach', needs: 'Opening, clear path', time: '15-30 min', cost: '€€' }
      },
      radar: {
        name: 'Heartbeat / breathing radar', short: 'Radar',
        returns: 'Distance to a person and a breathing signal, no direction',
        pros: ['Finds unconscious people', 'Penetrates loose rubble'],
        cons: ['Rebar in slabs blocks it', 'No direction; vibration interferes'],
        how: 'Place it on the rubble while everyone keeps still. Compare 2 or 3 spots.',
        cmp: { returns: 'Distance + breathing', strengths: 'Unconscious, loose rubble', weaknesses: 'Reinforced concrete, no direction', needs: 'No movement nearby', time: '≈5-10 min/spot', cost: '€€€' }
      },
      phone: {
        name: 'Phone detector', short: 'Phones',
        returns: 'List of devices: signal strength and distance estimate',
        pros: ['Finds silent and unconscious people', 'Long range'],
        cons: ['Only if the phone works and has charge', 'Concrete distorts the distance'],
        how: 'Measure at several spots. A stronger signal means the phone is closer.',
        cmp: { returns: 'Device list, dBm', strengths: 'Unconscious, deep', weaknesses: 'Battery, false hits (rescuers, neighbours)', needs: 'A working phone', time: '≈2-5 min', cost: '€€ to €€€' }
      },
      thermal: {
        name: 'Thermal drone', short: 'Thermal',
        returns: 'Thermal image of the area from above',
        pros: ['Fast overview of a large area', 'Warm spots stand out at night'],
        cons: ['Sees surfaces only', 'By day, sun-heated debris clutters the image'],
        how: 'Click an area and the drone images it. Compare day and night.',
        cmp: { returns: 'Thermal image', strengths: 'Overview, night, people on surface', weaknesses: 'Not through concrete, sun', needs: 'Flight over site, best at night', time: '≈5 min/area', cost: '€€' }
      },
      dog: {
        name: 'Search dog', short: 'Dog',
        returns: 'An alert (or none), rough direction, confidence',
        pros: ['Searches the surface fast', 'Smells silent and unconscious people'],
        cons: ['Tires after a few searches', 'No depth; points where scent exits'],
        how: 'Click the centre of an area (6 m radius). Let the dog rest.',
        cmp: { returns: 'Alert + direction', strengths: 'Speed, live scent', weaknesses: 'Fatigue, depth, other scents', needs: 'Handler, rest, few people', time: '≈10-20 min/area', cost: '€ (years of training)' }
      }
    },
    compare: {
      title: 'Compare tools',
      cols: { tool: 'Tool', returns: 'Returns', strengths: 'Strengths', weaknesses: 'Weaknesses', needs: 'Needs', time: 'Time', cost: 'Cost' }
    },
    scene: { scale: '10 m', front: 'FRONT (street)', back: 'BACK (yard)' }
  }
};
