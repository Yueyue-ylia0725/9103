let noiseGarden;

function setup() {
  createCanvas(780, 1000);
  noiseGarden = new NoiseGarden();
  setupTimeMechanic();
  // Other mechanics: initialize here after their scripts are added.
}

function draw() {
  // Other mechanics: update shared garden state here if needed.
  if (typeof noiseGarden.update === 'function') {
    noiseGarden.update(deltaTime / 1000);
  }
  updateTimeMechanic();
  noiseGarden.display();
}
