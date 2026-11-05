// Time-based mechanic — Yu Zhou
// Flowers grow fully opaque, remain in bloom, then fade out.
// Staggered start times create a repeating garden life cycle.
// ChatGPT/Codex helps modify the code
// Check its correctness and explain the problem.
// Yu Zhou tested the versions and selected the timing
// and fully opaque growth behaviour.

// Time-based animation: flower life cycle

let growthStartFrame;

let growthDuration = 600; // About 10 seconds at 60 FPS.
let bloomDuration = 300;  // About 5 seconds.
let fadeDuration = 300;   // About 5 seconds.
let maxBloomDelay = 240;  // Spread flower starts across about 4 seconds.

function setupTimeMechanic() {
  growthStartFrame = frameCount;

  for (let i = 0; i < noiseGarden.flowers.length; i++) {
    let flower = noiseGarden.flowers[i];

    // Give each flower a different starting time.
    flower.bloomDelay = map(
      i,
      0,
      noiseGarden.flowers.length - 1,
      0,
      maxBloomDelay
    );

    flower.growthScale = 0.1;
    flower.lifeOpacity = 0;
  }
}

function updateTimeMechanic() {
  let flowerDuration = growthDuration + bloomDuration + fadeDuration;

  // Allow the last flower to finish before the garden starts again.
  let cycleDuration = flowerDuration + maxBloomDelay;
  let cycleFrame = (frameCount - growthStartFrame) % cycleDuration;

  for (let flower of noiseGarden.flowers) {
    // Each flower follows the same stages, starting at a different time.
    let localFrame = cycleFrame - flower.bloomDelay;

    if (localFrame < 0) {
      // Wait until this flower's start time.
      flower.growthScale = 0.1;
      flower.lifeOpacity = 0;

    } else if (localFrame < growthDuration) {
      // Grow while remaining fully opaque.
      let progress = constrain(localFrame / growthDuration, 0, 1);

      flower.growthScale = lerp(0.1, 1, progress);
      flower.lifeOpacity = 255;

    } else if (localFrame < growthDuration + bloomDuration) {
      // Remain in full bloom.
      flower.growthScale = 1;
      flower.lifeOpacity = 255;

    } else if (localFrame < flowerDuration) {
      // Gradually fade after blooming.
      let fadeFrame = localFrame - growthDuration - bloomDuration;
      let progress = constrain(fadeFrame / fadeDuration, 0, 1);

      flower.growthScale = 1;
      flower.lifeOpacity = lerp(255, 0, progress);

    } else {
      // Stay hidden until the next garden cycle.
      flower.growthScale = 0.1;
      flower.lifeOpacity = 0;
    }
  }
}