let gardenAudioTrack;
let gardenAudioButton;
let gardenVolumeSlider;

let gardenAmplitude;
let gardenFFT;

let gardenAudioLevel = 0;
let gardenGoldLevel = 0;

function preloadGardenAudio() {
  gardenAudioTrack = loadSound("assets/garden music.mp3");
}

function setupGardenAudio() {
  gardenAudioButton = createButton("Play music");
  gardenAudioButton.mousePressed(toggleGardenAudio);

  // Control the music volume.
  createSpan(" Music volume ");
  gardenVolumeSlider = createSlider(0, 1, 0.7, 0.01);
  gardenAudioTrack.setVolume(gardenVolumeSlider.value());

  // Measure the music's overall amplitude.
  gardenAmplitude = new p5.Amplitude();
  gardenAmplitude.setInput(gardenAudioTrack);

  // Analyse frequency energy in the selected music.
  gardenFFT = new p5.FFT(0.65, 1024);
  gardenFFT.setInput(gardenAudioTrack);
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
  let musicVolume = gardenVolumeSlider.value();
  gardenAudioTrack.setVolume(musicVolume);

  let targetLevel = 0;
  let targetGoldLevel = 0;

  // Analyse before reading frequency energy.
  gardenFFT.analyze();

  if (gardenAudioTrack.isPlaying() && musicVolume > 0) {
    targetLevel = gardenAmplitude.getLevel();

    // Use mid-frequency energy for the golden light.
    let pianoEnergy = gardenFFT.getEnergy(250, 2000);

    targetGoldLevel = constrain(
      map(pianoEnergy, 40, 150, 0, 1),
      0,
      1
    );
  }

  // Smooth the changes to avoid sudden flashes.
  gardenAudioLevel = lerp(
    gardenAudioLevel,
    targetLevel,
    0.08
  );

  gardenGoldLevel = lerp(
    gardenGoldLevel,
    targetGoldLevel,
    0.08
  );

  if (!gardenAudioTrack.isPlaying()) {
    gardenAudioButton.html("Play music");
  }
}

function getGardenGoldBoost() {
  return map(gardenGoldLevel, 0, 1, 0, 120);
}

function drawGardenFlowerGlow(
  x,
  y,
  flowerDiameter,
  flowerOpacity = 255
) {
  let glowStrength = constrain(
    map(gardenAudioLevel, 0, 0.14, 0, 1),
    0,
    1
  );

  let glowDiameter = flowerDiameter * map(
    glowStrength,
    0,
    1,
    1.5,
    3.6
  );

  let glowAlpha = map(glowStrength, 0, 1, 0, 55);

  // Fade the glow together with the flower.
  glowAlpha = glowAlpha * flowerOpacity / 255;

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