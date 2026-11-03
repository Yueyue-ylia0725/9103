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

// Store the temporary petals and leaves separately from falling flowers.
// Each trail mark has its own position, appearance and fading opacity.
let trailElements = [];
let nextTrailIsLeaf = false;

class TrailElement {
  constructor(x, y, isLeaf) {
    // Remember where the mouse was when this mark was created.
    // The mark stays at this position while the mouse moves on.
    this.x = x;
    this.y = y;
    this.isLeaf = isLeaf;

    // Vary the size and angle slightly to avoid identical repeated marks.
    this.size = random(10, 18);
    this.angle = random(TWO_PI);
    this.opacity = 200;

    // Store RGB values from the garden palette.
    // Keeping colours in a limited palette connects the trail to the garden.
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
    // Lower opacity every frame so the trail gradually disappears.
    // At 60 frames per second, each mark lasts about 0.8 seconds.
    this.opacity -= 2;
  }

  display() {
    // Isolate drawing settings from the other garden mechanics.
    push();

    // Move the origin to this mark, then rotate its local drawing space.
    translate(this.x, this.y);
    angleMode(RADIANS);
    rotate(this.angle);
    ellipseMode(CENTER);
    noStroke();

    // Keep the same colour while reducing its alpha (transparency).
    fill(
      this.colour[0],
      this.colour[1],
      this.colour[2],
      this.opacity
    );

    // Use a narrow ellipse for a leaf and a wider ellipse for a petal.
    if (this.isLeaf) {
      ellipse(0, 0, this.size, this.size * 0.4);
    } else {
      ellipse(0, 0, this.size * 0.65, this.size);
    }

    pop();
  }
}

function createInputTrail(x, y) {
  // Create one mark at the current mouse position.
  trailElements.push(
    new TrailElement(x, y, nextTrailIsLeaf)
  );

  // Alternate petals and leaves instead of generating only one type.
  nextTrailIsLeaf = !nextTrailIsLeaf;
}

function updateInputTrail() {
  // Keep only visible marks, so faded objects do not accumulate.
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
  // The garden is redrawn each frame, so active marks must also be redrawn.
  for (const element of trailElements) {
    element.display();
  }
}