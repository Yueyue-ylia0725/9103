let noiseGarden;

function setup() {
  createCanvas(780, 1000);
  noiseGarden = new NoiseGarden();

  // Initialise the time-based flower growth.
  setupTimeMechanic();
}

function draw() {
  // Time value used by the existing noise mechanic.
  const dt = Math.min(deltaTime / 1000, 0.1);

  // Update the noise movement.
  if (typeof noiseGarden.update === "function") {
    noiseGarden.update(dt);
  }

  // Update growth and draw the garden.
  updateTimeMechanic();
  noiseGarden.display();

  // Update and draw Input flowers above the garden.
  updateInput();
  drawInput();
}

function mousePressed() {
  const insideCanvas =
    mouseX >= 0 &&
    mouseX < width &&
    mouseY >= 0 &&
    mouseY < height;

  if (insideCanvas) {
    createInputFlower(mouseX, mouseY);
  }
}