let gardenAudioTrack;
let gardenAudioButton;
let gardenAmplitude;
let gardenAudioLevel = 0;

function preloadGardenAudio() {
  gardenAudioTrack = loadSound("assets/garden music.mp3");
}

function setupGardenAudio() {
  gardenAudioButton = createButton("Play music");
  gardenAudioButton.mousePressed(toggleGardenAudio);

  gardenAmplitude = new p5.Amplitude();
  gardenAmplitude.setInput(gardenAudioTrack);
}

function toggleGardenAudio() {
  if (gardenAudioTrack.isPlaying()) {
    gardenAudioTrack.pause();
    gardenAudioButton.html("Play music");
  } else {
    gardenAudioTrack.play();
    gardenAudioButton.html("Pause music");
  }
}

function updateGardenAudio() {
  let targetLevel = 0;

  if (gardenAudioTrack.isPlaying()) {
    targetLevel = gardenAmplitude.getLevel();
  }

  gardenAudioLevel = lerp(gardenAudioLevel, targetLevel, 0.08);
}

function drawGardenFlowerGlow(x, y, flowerDiameter) {
  let glowStrength = map(gardenAudioLevel, 0, 0.2, 0, 1);
  glowStrength = constrain(glowStrength, 0, 1);

  let glowDiameter = flowerDiameter * map(glowStrength, 0, 1, 1.5, 3.6);
  let glowAlpha = map(glowStrength, 0, 1, 0, 55);

  push();
  noStroke();

  for (let layer = 10; layer >= 1; layer--) {
    let layerDiameter = glowDiameter * layer / 10;
    let layerAlpha = glowAlpha * (11 - layer) / 10;

    fill(255, 220, 120, layerAlpha);
    circle(x, y, layerDiameter);
  }

  pop();
}