// Time-based flower life cycle.
// Timing depends on the actual frame rate.

let growthStartFrame;

let growthDuration = 600; // About 10 seconds at 60 FPS.
let bloomDuration = 300;  // About 5 seconds.
let fadeDuration = 300;   // About 5 seconds.

function setupTimeMechanic() {
  growthStartFrame = frameCount;

  for (let flower of noiseGarden.flowers) {
    flower.growthScale = 0.1;
    flower.lifeOpacity = 255;
  }
}

function updateTimeMechanic() {
  let cycleDuration = growthDuration + bloomDuration + fadeDuration;

  // Repeat the timeline from 0 each cycle.
  let cycleFrame = (frameCount - growthStartFrame) % cycleDuration;

  for (let flower of noiseGarden.flowers) {
    if (cycleFrame < growthDuration) {
      // Stage 1: grow while remaining fully opaque.
      let progress = constrain(cycleFrame / growthDuration, 0, 1);

      flower.growthScale = lerp(0.1, 1, progress);
      flower.lifeOpacity = 255;

    } else if (cycleFrame < growthDuration + bloomDuration) {
      // Stage 2: remain fully grown and fully opaque.
      flower.growthScale = 1;
      flower.lifeOpacity = 255;

    } else {
      // Stage 3: keep the size and gradually fade out.
      let fadeFrame = cycleFrame - growthDuration - bloomDuration;
      let progress = constrain(fadeFrame / fadeDuration, 0, 1);

      flower.growthScale = 1;
      flower.lifeOpacity = lerp(255, 0, progress);
    }
  }
}