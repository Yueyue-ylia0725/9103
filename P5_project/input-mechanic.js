// User Input mechanic — Jie Zhou
// Click to create falling flowers.
// Move the mouse to leave gently drifting petals and leaves.

// --------------------------------------------------
// Click interaction: falling flowers
// --------------------------------------------------

let fallingFlowers = [];

class FallingFlower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.fallSpeed = 1;

    // Reuse the shared garden specifications for visual consistency.
    const spec = random(GARDEN_BLOOMS);
    this.radius = spec[2];

    const body = spec[3];
    const centre = spec[4];
    const petals = spec[5];

    // Flower drawing follows GardenForegroundFlower in garden.js.
    // Draw the image once, then reuse it while the flower moves.
    const side = Math.ceil(this.radius * 2 + 12);
    this.sprite = createGraphics(side, side);

    const g = this.sprite;
    const r = this.radius;

    g.pixelDensity(2);
    g.angleMode(RADIANS);
    g.translate(g.width / 2, g.height / 2);
    g.noStroke();

    const phase = random(TWO_PI);
    const rim = [];

    // Create the same gently scalloped outline as the garden flowers.
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TWO_PI;

      const radius = r * (
        0.975 +
        0.025 * Math.cos(a * petals + phase) +
        0.03 * Math.sin(a * 3 + phase)
      );

      rim.push([
        Math.cos(a) * radius,
        Math.sin(a) * radius
      ]);
    }

    g.fill(body);
    g.beginShape();

    for (let i = -1; i <= rim.length + 1; i++) {
      const point = rim[(i + rim.length) % rim.length];
      g.curveVertex(point[0], point[1]);
    }

    g.endShape(CLOSE);

    // Subtle petal tones follow the shared flower design.
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * TWO_PI + phase;
      const shade = i % 3 === 0 ? "#674760" : "#E3D6C4";
      const amount = i % 3 === 0 ? 0.055 : 0.07;

      g.push();
      g.rotate(a);
      g.fill(lerpColor(color(body), color(shade), amount));

      g.beginShape();
      g.vertex(r * 0.08, 0);

      g.bezierVertex(
        r * 0.30, -r * 0.18,
        r * 0.76, -r * 0.25,
        r * 0.91, -r * 0.06
      );

      g.bezierVertex(
        r * 0.73, r * 0.15,
        r * 0.27, r * 0.12,
        r * 0.08, 0
      );

      g.endShape(CLOSE);
      g.pop();
    }

    // Draw the flower centre and its small highlight.
    g.fill(centre);
    g.ellipse(
      -r * 0.04,
      r * 0.025,
      r * 0.25,
      r * 0.23
    );

    g.fill(lerpColor(color(centre), color("#E3D6C4"), 0.25));
    g.ellipse(
      -r * 0.075,
      -r * 0.025,
      r * 0.075,
      r * 0.055
    );
  }

  update() {
    // Increase the vertical position to move down one pixel per frame.
    this.y += this.fallSpeed;
  }

  display() {
    // Keep image settings separate from other garden mechanics.
    push();
    imageMode(CORNER);

    // Centre the flower image on its stored position.
    image(
      this.sprite,
      this.x - this.sprite.width / 2,
      this.y - this.sprite.height / 2
    );

    pop();
  }

  isOffScreen() {
    // Check the top edge so the whole flower leaves before removal.
    return this.y - this.sprite.height / 2 > height;
  }
}

function createInputFlower(x, y) {
  fallingFlowers.push(new FallingFlower(x, y));
}

function updateInput() {
  // Keep only flowers that are still on screen.
  let remainingFlowers = [];

  for (const flower of fallingFlowers) {
    flower.update();

    if (!flower.isOffScreen()) {
      remainingFlowers.push(flower);
    }
  }

  fallingFlowers = remainingFlowers;
}

function drawInput() {
  for (const flower of fallingFlowers) {
    flower.display();
  }
}

// --------------------------------------------------
// Mouse movement: drifting and fading petals and leaves
// --------------------------------------------------

let trailElements = [];
let nextTrailIsLeaf = false;

class TrailElement {
  constructor(x, y, isLeaf) {
    // Start each mark at the mouse position.
    this.x = x;
    this.y = y;
    this.isLeaf = isLeaf;

    // Larger marks are easier to see against the detailed background.
    this.size = random(20, 28);
    this.angle = random(TWO_PI);
    this.opacity = 200;

    // Choose movement values once so the marks drift smoothly.
    // Choosing new random speeds every frame would cause shaking.
    this.driftX = random(-0.3, 0.3);
    this.driftY = random(0.15, 0.4);
    this.rotationSpeed = random(-0.006, 0.006);

    // Keep the colours within the garden palette.
    if (this.isLeaf) {
      this.colour = random([
        [99, 146, 100],
        [115, 160, 88],
        [83, 132, 116]
      ]);
    } else {
      this.colour = random([
        [239, 151, 148],
        [247, 172, 39],
        [225, 128, 156]
      ]);
    }
  }

  update() {
    // Slight sideways and downward movement softens the mouse path.
    this.x += this.driftX;
    this.y += this.driftY;

    // A slow rotation gives each mark a gentle floating movement.
    this.angle += this.rotationSpeed;

    // Fade over roughly 1.7 seconds at 60 frames per second.
    this.opacity -= 2;
  }

  display() {
    // Isolate transformations and drawing styles from other mechanics.
    push();
    translate(this.x, this.y);
    angleMode(RADIANS);
    rotate(this.angle);
    ellipseMode(CENTER);
    noStroke();

    // Keep the RGB colour fixed while its transparency changes.
    fill(
      this.colour[0],
      this.colour[1],
      this.colour[2],
      this.opacity
    );

    if (this.isLeaf) {
      // Use a narrow ellipse for the leaf body.
      ellipse(0, 0, this.size, this.size * 0.5);

      // Veins make the leaf more recognisable.
      // They fade at the same rate as the leaf body.
      stroke(55, 90, 60, this.opacity);
      strokeWeight(1);

      // Central vein.
      line(
        -this.size * 0.4, 0,
        this.size * 0.4, 0
      );

      // Side veins.
      line(
        -this.size * 0.15, 0,
        -this.size * 0.3, -this.size * 0.15
      );

      line(
        this.size * 0.15, 0,
        0, -this.size * 0.18
      );

      line(
        -this.size * 0.15, 0,
        -this.size * 0.3, this.size * 0.15
      );

      line(
        this.size * 0.15, 0,
        0, this.size * 0.18
      );
    } else {
      // Use a broader ellipse for the petal.
      ellipse(0, 0, this.size * 0.7, this.size);

      // A translucent highlight adds detail without a new drawing technique.
      fill(255, 235, 220, this.opacity * 0.3);
      ellipse(
        -this.size * 0.1,
        -this.size * 0.1,
        this.size * 0.2,
        this.size * 0.55
      );
    }

    pop();
  }
}

function createInputTrail(x, y) {
  // Add one mark when the mouse has moved far enough.
  // The spacing check is handled in sketch.js.
  trailElements.push(
    new TrailElement(x, y, nextTrailIsLeaf)
  );

  // Alternate between petals and leaves.
  nextTrailIsLeaf = !nextTrailIsLeaf;
}

function updateInputTrail() {
  // Update every mark, then retain only those that are still visible.
  // This stops invisible trail objects accumulating.
  let remainingTrail = [];

  for (const element of trailElements) {
    element.update();

    if (element.opacity > 0) {
      remainingTrail.push(element);
    }
  }

  trailElements = remainingTrail;
}

function drawInputTrail() {
  // Redraw marks each frame because the garden is also redrawn.
  for (const element of trailElements) {
    element.display();
  }
}