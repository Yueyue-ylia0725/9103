// User Input mechanic — Jie Zhou
// Flower drawing follows the shared garden.js flower design.
// Clicking creates a flower that moves downward.

let fallingFlowers = [];

class FallingFlower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.fallSpeed = 1;

    // Choose an existing garden flower specification.
    const spec = random(GARDEN_BLOOMS);
    this.radius = spec[2];

    const body = spec[3];
    const centre = spec[4];
    const petals = spec[5];

    // Prepare the flower image using the shared garden style.
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

    // Create a gently scalloped flower outline.
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

    // Add subtle petal shapes.
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

    // Draw the flower centre and highlight.
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

  // Move one pixel downward each frame.
  update() {
    this.y += this.fallSpeed;
  }

  display() {
    push();
    imageMode(CORNER);

    image(
      this.sprite,
      this.x - this.sprite.width / 2,
      this.y - this.sprite.height / 2
    );

    pop();
  }

  isOffScreen() {
    return this.y - this.sprite.height / 2 > height;
  }
}

// Add a new flower at the mouse position.
function createInputFlower(x, y) {
  fallingFlowers.push(new FallingFlower(x, y));
}

// Keep only flowers that have not left the canvas.
function updateInput() {
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