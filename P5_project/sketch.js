let noiseGarden;

// Store the last trail position so marks do not overlap too closely.
let lastTrailX = -100;
let lastTrailY = -100;

function setup() {
  createCanvas(780, 1000);
  noiseGarden = new NoiseGarden();

  // Initialise the existing time-based flower growth.
  setupTimeMechanic();
}

function draw() {
  // Keep the time calculation used by the existing noise mechanic.
  const dt = Math.min(deltaTime / 1000, 0.1);

  if (typeof noiseGarden.update === "function") {
    noiseGarden.update(dt);
  }

  // Update growth before drawing the garden.
  updateTimeMechanic();
  noiseGarden.display();

  // Draw falling flowers above the garden.
  updateInput();
  drawInput();

  // Update fading marks even when the mouse stops moving.
  updateInputTrail();
  drawInputTrail();
}

function mousePressed() {
  // Check that the click is inside the artwork.
  const insideCanvas =
    mouseX >= 0 &&
    mouseX < width &&
    mouseY >= 0 &&
    mouseY < height;

  if (insideCanvas) {
    createInputFlower(mouseX, mouseY);
  }
}

function mouseMoved() {
  const insideCanvas =
    mouseX >= 0 &&
    mouseX < width &&
    mouseY >= 0 &&
    mouseY < height;

  if (insideCanvas) {
    // Measure how far the mouse has moved since the last mark.
    const distanceMoved = dist(
      mouseX,
      mouseY,
      lastTrailX,
      lastTrailY
    );

    // Leave at least 20 pixels between marks to reduce trail density.
    if (distanceMoved >= 20) {
      createInputTrail(mouseX, mouseY);

      // Remember this position for the next distance check.
      lastTrailX = mouseX;
      lastTrailY = mouseY;
    }
  } else {
    // Allow a new trail to start when the mouse enters the canvas again.
    lastTrailX = -100;
    lastTrailY = -100;
  }
}