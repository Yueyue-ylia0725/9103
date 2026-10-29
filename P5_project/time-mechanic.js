let growthStartFrame;
let growthDuration = 600; // About 10 seconds at 60 frames per second.

function setupTimeMechanic() {
  growthStartFrame = frameCount;

  // Start every flower at 10% of its original size.
  for (let flower of noiseGarden.flowers) {
    flower.growthScale = 0.1;
  }
}

function updateTimeMechanic() {
  let elapsedFrames = frameCount - growthStartFrame;

  // Limit progress to the range 0–1.
  let progress = constrain(elapsedFrames / growthDuration, 0, 1);

  for (let flower of noiseGarden.flowers) {
    flower.growthScale = lerp(0.1, 1, progress);
  }
}