window.SIM = window.SIM || {};
SIM.CONFIG = {

  conditions: { noise: 0.3, night: false, hours: 6 },
  hoursMax: 96,

  slabThickness: 0.22,

  costs: {
    geophone: { timeH: 0.4, price: 1 },
    camera:   { timeH: 0.5, price: 2 },
    radar:    { timeH: 0.5, price: 3 },
    phone:    { timeH: 0.2, price: 2 },
    thermal:  { timeH: 0.3, price: 2 },
    dog:      { timeH: 0.3, price: 1 }
  },

  marks: {
    max: 8,
    radiusM: 2.0,
    falseCostH: 3
  },

  tools: {
    geophone: {
      tapLevelDb: 70,
      weakTapDb: 60,
      slabLossDb: 10,
      rubbleLossDbPerM: 6,
      soilLossDbPerM: 4,
      airLossDbPerM: 0.3,
      noiseFloorDb: 15,
      noiseRangeDb: 45,
      nightQuieterDb: 5,
      detectSnrDb: 6,
      bearingErrMinDeg: 15,
      bearingErrMaxDeg: 70,
      settlingHours: 10
    },
    camera: {
      maxLengthM: 3,
      lightRangeM: 3.2,
      fovDeg: 70,
      steerDegPerM: 150,
      clearanceM: 0.06,
      deflectDeg: 85,
      accessRadiusM: 2.5,

      blindRadiusM: 1.0,
      blindSearchH: 0.1,
      stepM: 0.2, stepDeg: 10
    },
    radar: {
      maxRangeM: 7,
      moveLevelDb: 75,
      breathLevelDb: 62,
      unconsciousBreathDb: 58,
      slabLossDb: 14,
      rubbleLossDbPerM: 3,
      soilLossDbPerM: 10,
      noiseFloorDb: 12,
      vibrationDb: 16,
      detectSnrDb: 6,
      rangeResM: 0.3,
      mergeM: 0.7
    },
    phone: {
      txDbm: 21,
      pl0Db: 40,
      pathExp: 2.2,
      estPathExp: 2.2,
      slabLossDb: 6,
      rubbleLossDbPerM: 1.5,
      soilLossDbPerM: 5,
      sensitivityDbm: -100,
      fadingDb: 2,
      displayMaxM: 200
    },
    thermal: {
      altitudeM: 25,
      footprintM: [24, 18],
      pixels: [120, 90],
      airDayC: 14, airNightC: 4,
      sunGainC: { rubble: 13, concrete: 9, ground: 6, metal: 16, building: 7, engine: 10, human: 2 },
      nightSkyCoolC: 2,
      textureC: { day: 1.2, night: 0.3 },
      bodyThroughCoverC: 16,
      coverDecayM: 0.15,
      plumeC: 5,
      plumeDecayM: 2,
      residualC: 3, residualHours: 36,
      fireC: 45, fireHours: 10,
      engineC: 40,
      humanC: 31,
      sensorNoiseC: 0.25
    },
    dog: {
      searchRadiusM: 6,
      slabFactor: 0.15,
      rubbleDecayM: 1.4,
      airDecayM: 6,
      soilDecayM: 0.3,
      outsideDecayM: 2.5,
      interestThreshold: 0.07,
      alertThreshold: 0.2,
      fatiguePerSearch: 0.15,
      fatigueImpact: 0.5,
      dayFactor: 0.85,
      noiseImpact: 0.3,
      scentBuildHours: 4
    }
  }
};
