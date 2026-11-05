// Audio mechanic — Liyang Ying
// Music amplitude controls flower halos.
// Frequency energy adjusts the golden highlights.
// ChatGPT and Codex helped explain the code, check its correctness,
// and revise parts of the implementation.
// Liyang Ying tested the versions and selected the visual refinements.

let gardenAudioTrack;
let gardenAmplitude;
let gardenFFT;

let gardenAudioStarted = false;
let gardenEffectsEnabled = true;
let gardenMusicVolume = 0.7;
let gardenMusicPosition = 0;

let gardenAudioLevel = 0;
let gardenGoldLevel = 0;

function preloadGardenAudio() {
  gardenAudioTrack = loadSound("assets/garden music.mp3");
}

function setupGardenAudio() {
  gardenAudioTrack.setVolume(gardenMusicVolume);

  gardenAmplitude = new p5.Amplitude();
  gardenAmplitude.setInput(gardenAudioTrack);

  gardenFFT = new p5.FFT(0.65, 1024);
  gardenFFT.setInput(gardenAudioTrack);
}

function playGardenMusic() {
  userStartAudio();

  gardenAudioTrack.stop();

  gardenAudioTrack.loop(
    0,
    1,
    gardenMusicVolume,
    gardenMusicPosition
  );

  gardenAudioStarted = true;
}

function handleGardenAudioClick() {
  if (!gardenAudioStarted) {
    playGardenMusic();
  }
}

function toggleGardenAudio() {
  if (gardenAudioTrack.isPlaying()) {
    gardenMusicPosition = gardenAudioTrack.currentTime();
    gardenAudioTrack.pause();
  } else {
    playGardenMusic();
  }
}

function jumpGardenAudio(seconds) {
  let keepPlaying = gardenAudioTrack.isPlaying();
  let position = gardenMusicPosition;

  if (keepPlaying) {
    position = gardenAudioTrack.currentTime();
  }

  gardenMusicPosition = constrain(
    position + seconds,
    0,
    Math.max(0, gardenAudioTrack.duration() - 0.05)
  );

  if (keepPlaying) {
    playGardenMusic();
  }
}

function handleGardenAudioKey() {
  if (key === " ") {
    toggleGardenAudio();
    return false;
  }

  if (keyCode === UP_ARROW) {
    gardenMusicVolume = constrain(
      gardenMusicVolume + 0.1,
      0,
      1
    );
    return false;
  }

  if (keyCode === DOWN_ARROW) {
    gardenMusicVolume = constrain(
      gardenMusicVolume - 0.1,
      0,
      1
    );
    return false;
  }

  if (keyCode === LEFT_ARROW) {
    jumpGardenAudio(-10);
    return false;
  }

  if (keyCode === RIGHT_ARROW) {
    jumpGardenAudio(10);
    return false;
  }

  if (key === "v" || key === "V") {
    gardenEffectsEnabled = !gardenEffectsEnabled;
    return false;
  }
}

function updateGardenAudio() {
  gardenAudioTrack.setVolume(gardenMusicVolume);

  if (gardenAudioTrack.isPlaying()) {
    gardenMusicPosition = gardenAudioTrack.currentTime();
  }

  let targetLevel = 0;
  let targetGoldLevel = 0;

  gardenFFT.analyze();

  if (
    gardenAudioTrack.isPlaying() &&
    gardenMusicVolume > 0
  ) {
    targetLevel = gardenAmplitude.getLevel();

    let pianoEnergy = gardenFFT.getEnergy(250, 2000);

    targetGoldLevel = constrain(
      map(pianoEnergy, 40, 150, 0, 1),
      0,
      1
    );
  }

  if (targetLevel > gardenAudioLevel) {
    gardenAudioLevel = lerp(
      gardenAudioLevel,
      targetLevel,
      0.2
    );
  } else {
    gardenAudioLevel = lerp(
      gardenAudioLevel,
      targetLevel,
      0.08
    );
  }

  if (targetGoldLevel > gardenGoldLevel) {
    gardenGoldLevel = lerp(
      gardenGoldLevel,
      targetGoldLevel,
      0.2
    );
  } else {
    gardenGoldLevel = lerp(
      gardenGoldLevel,
      targetGoldLevel,
      0.08
    );
  }
}

function getGardenGoldBoost() {
  if (!gardenEffectsEnabled) {
    return 0;
  }

  return map(gardenGoldLevel, 0, 1, 0, 150);
}

function drawGardenFlowerGlow(
  x,
  y,
  flowerDiameter,
  flowerOpacity = 255
) {
  if (
    !gardenEffectsEnabled ||
    flowerDiameter <= 1 ||
    flowerOpacity <= 0
  ) {
    return;
  }

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

  let glowAlpha = map(
    glowStrength,
    0,
    1,
    0,
    55
  ) * flowerOpacity / 255;

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