# The Italian Garden — A Living Garden

**IDEA9103 Creative Coding Major Project | Group E**

**Chosen option:** Reinterpret an existing artwork.

*The Italian Garden* is an interactive p5.js artwork inspired by Gustav Klimt's *The Italian Garden* (1913). Our project transforms the painting into a living digital landscape through four mechanics: audio, time-based animation, Perlin noise and randomness, and user input.

The garden retains dark vertical tree trunks, layered vegetation, colourful flowers and central golden decoration. Movement, changing light and temporary floral traces bring these elements to life while preserving the overall composition.

---

## 1. Inspiration

### Artistic Inspiration

Our main inspiration is Gustav Klimt's *The Italian Garden*. We focused on the contrast between dark tree trunks and luminous garden spaces, the dense arrangement of flowers, and the repetition of decorative colours and shapes.

Rather than reproduce every detail, we translated these qualities into irregular colour blocks, curved outlines and overlapping layers. The result is an abstract interpretation that supports animation and interaction.

Our colour choices follow the painting's spatial structure:

- **Dark navy, blue and purple** establish the tree trunks and shadows.
- **Pale blue, cream and muted cyan** create depth in the background.
- **Forest green, grass green and sage** connect the vegetation.
- **Pink, yellow, orange and red** flowers create foreground focal points.
- **Golden decoration** introduces a warm vertical rhythm near the centre.
  

| Original Painting | Final Interactive Garden |
| --- | --- |
|![The Italian Garden](P5_project/assets/The%20Italian%20Garden.png) | ![The Italian Garden2](P5_project/assets/The%20Italian%20Garden2.png.jpg)

### Interaction Concept

We wanted the garden to remain active even when the viewer does not interact with it. Flowers grow and fade, leaves sway, and light moves across the golden areas.

The viewer can also participate by playing music, moving the mouse and clicking within the garden. All four mechanics share the same visual language so that their effects feel like parts of one environment.

---

## 2. Techniques

### Layered Shapes and Colour Blocks

The garden is constructed from stored contour data, irregular colour blocks and independently drawn flowers.

Functions such as `beginShape()`, `quadraticVertex()`, `curveVertex()` and Bézier curves create rounded, painterly outlines. Drawing order controls the relationships between the background, tree trunks, vegetation, stems and flower heads.

We use `createGraphics()` to prepare reusable flower sprites and separate drawing layers. This allows static geometry and animated effects to be managed independently.

### Audio Mechanic

The audio mechanic uses `loadSound()` to load the soundtrack and `p5.Amplitude()` to measure its amplitude.

The measured level is converted into glow size and transparency using `map()`. A `lerp()` operation smooths the changes so that the lighting responds gradually rather than jumping between values.

Selected foreground flowers have warm halos made from overlapping translucent circles. Louder passages produce larger, brighter halos, while quieter passages produce subtler effects.

A **Play music / Pause music** button controls playback.

**Key techniques:**
- `loadSound()` — Loads the soundtrack.
- `p5.Amplitude()` — Measures audio intensity.
- `map()` — Converts audio levels into visual properties.
- `lerp()` — Smooths changes in glow intensity.
- Play/Pause controls — Allow users to control music playback.

### Time-Based Mechanic

The time-based mechanic gives the foreground flowers a repeating life cycle:

1. **Growth:** Flowers gradually increase in size.
2. **Bloom:** Flowers remain at their full size.
3. **Fade:** Flowers gradually become transparent.
4. **Repeat:** The sequence restarts.

Each flower has a different `bloomDelay`, allowing flowers to appear at different times.

The implementation uses `frameCount`, conditional stage logic, `constrain()` and `lerp()` to calculate growth and opacity. Because the sequence uses frame counts, its duration depends on the actual frame rate.

**Key techniques:**
- `frameCount` — Tracks animation progression.
- Conditional statements — Control different growth stages.
- `constrain()` — Limits growth and opacity values.
- `lerp()` — Creates gradual visual transitions.
- Arrays — Store and manage multiple flower objects.

This mechanic introduces a continuous rhythm of growth, blooming and fading into the garden.

### Perlin Noise and Randomness

The Perlin Noise and Randomness Mechanic creates smooth, natural movement and subtle visual variation within the garden.

#### Perlin Noise — Natural Movement

Perlin noise is used to animate leaves, flowers and selected background colour blocks.

Unlike completely random movement, `noise()` produces smooth and continuous changes over time, creating a natural wind-like effect.

Each element maintains its original position using `baseX` and `baseY`, while noise values calculate temporary movement offsets. This prevents elements from drifting permanently away from the original composition.

Different elements have different movement behaviours:

- **Tree trunks:** Remain stable to preserve the original composition.
- **Upper leaves:** Sway gently with individual movement variations.
- **Flowers:** Move more noticeably, with slight rotation and corresponding stem movement.
- **Background colour blocks:** Drift slowly to create subtle depth.
- **Golden colour blocks:** Have independently adjustable movement settings.

The `translate()` and `rotate()` functions apply movement and rotation, while `push()` and `pop()` isolate transformations so that one element's movement does not affect the entire scene.

#### Randomness — Visual Variation

Randomness is used during initialisation to create subtle differences between individual elements without changing the overall garden composition.

The `random()` function contributes to variations in:

- Movement strength and noise sampling offsets.
- Flower stem lengths and initial rotations.
- Selected shapes and decorative details.
- The positions, lengths and movement phases of golden decorative lines.
- The selection of background elements that participate in animation.

These variations make the garden feel more organic and less repetitive while maintaining a consistent visual style.

#### Development from the Original Concept

Our initial concept included regenerating different garden compositions using random seeds.

However, this feature was removed during development to maintain the recognisable structure of Klimt's original painting.

Instead, a fixed seed is used to preserve the overall composition and repeatable visual details, while randomness continues to create variation between individual elements.

Refreshing the page therefore restarts the animation without generating a differently arranged garden.

This design decision allows the artwork to remain visually consistent while introducing natural movement and subtle variation.

#### Golden Flowing-Light Effect

An additional flowing-light effect was developed for the central golden decoration, one of the distinctive visual elements of Klimt's original painting.

The effect uses a Perlin noise field to generate smoothly changing highlights and shadows across the golden surface.

By gradually shifting the noise sampling coordinates downward over time, the animation creates the appearance of light flowing along the golden decorative elements.

A mask restricts the effect to the golden colour blocks and maintains the correct overlapping relationships with surrounding vegetation.

The movement of the golden colour blocks and the flowing-light effect are controlled independently, allowing the surface lighting to change without disrupting the original composition.

This addition enhances the sense of movement and visual depth while preserving the artwork's central golden structure.

**Key techniques:**
- `noise()` — Generates smooth changes in the light pattern.
- Time-based sampling offsets — Create the appearance of flowing light.
- Graphics masks — Restrict the effect to golden regions.
- Layered rendering — Maintains correct visual relationships with surrounding vegetation.

### User Input Mechanic

The User Input Mechanic allows viewers to interact directly with the garden through mouse movement and clicking.

Mouse movement creates a temporary trail of alternating petals and leaves. Each trail element receives its own size, angle, drift and rotation values.

The marks slowly move, rotate and fade. A distance check spaces new elements along the cursor path, preventing excessive overlap. Fully faded elements are removed from the array.

Clicking within the canvas creates a flower at the cursor position. The flower uses the shared garden palette and flower specifications, falls downward, and is removed after leaving the canvas.

**Key techniques:**
- `mouseX` / `mouseY` — Track cursor position.
- Mouse event functions — Detect movement and clicks.
- Arrays — Store temporary trail elements and falling flowers.
- Random values — Introduce variation in floral elements.
- Opacity transitions — Create fading trails.
- Position updates — Animate falling flowers.

This mechanic allows viewers to actively participate in the garden rather than simply observing its animation.

### Classes, Arrays and Shared Data

Classes organise the garden marks, foreground flowers, falling flowers and trail elements.

Arrays store their instances so that each object can be updated and drawn consistently.

Shared flower specifications keep the permanent garden flowers and click-generated flowers visually related.

### Code Structure

Each mechanic is stored in a separate JavaScript file and integrated through the main sketch.

| File | Responsibility |
|---|---|
| `P5_project/index.html` | Loads libraries and project scripts. |
| `P5_project/sketch.js` | Contains the main `preload()`, `setup()`, `draw()` and mouse event functions. |
| `P5_project/reference-shapes.js` | Stores the garden's base colour and contour data. |
| `P5_project/garden.js` | Defines shared geometry, garden marks, flower objects and drawing order. |
| `P5_project/noise-mechanic.js` | Controls natural movement, random variation, independent golden-block motion and masked flowing light. |
| `P5_project/time-mechanic.js` | Controls flower growth, bloom, fading and repetition. |
| `P5_project/input-mechanic.js` | Creates mouse trails and falling flowers. |
| `P5_project/audio mechanic.js` | Controls music playback, amplitude analysis and flower glows. |
| `P5_project/assets/` | Contains project assets, including the soundtrack. |
| `P5_project/libraries/` | Contains the local p5.js and p5.sound libraries. |

The main sketch connects the four mechanics within a shared visual environment.

Separating the mechanics into individual files makes the code easier to understand, maintain and integrate during group development.

---

## 3. Mechanic Ownership

Each group member is responsible for developing one creative coding mechanic.

| Team Member | Mechanic | Contribution |
|---|---|---|
| **Liyang Ying** | Audio | Developed music playback controls, amplitude analysis, and audio-responsive flower glow size and brightness. |
| **Yu Zhou** | Time-Based | Developed flower growth, blooming, fading, staggered start times and repeating life cycles. |
| **Yueyue Liang** | Perlin Noise & Randomness | Developed noise-driven movement for leaves, flowers and background colour blocks, including flower-stem swaying, controlled random variation, independently animated golden elements and a masked golden flowing-light effect. |
| **Jie Zhou** | User Input | Developed fading petal and leaf trails, click-generated flowers and their downward movement. |

### Mechanic Integration

All four mechanics operate within the shared garden composition.

- **Audio** changes visual brightness and glow intensity.
- **Time-Based Animation** controls flower growth and life cycles.
- **Perlin Noise & Randomness** creates organic movement, individual variation and flowing golden highlights.
- **User Input** allows viewers to create temporary floral elements through mouse interaction.

Although each mechanic controls different properties, they share consistent colours, shapes and drawing conventions.

Together, they create a cohesive interactive interpretation of the original painting.

---

## 4. AI Acknowledgement

We used **OpenAI ChatGPT, Codex and OpenAI image generation tools** during project development.

### ChatGPT and Codex

ChatGPT and Codex assisted with:

- Organising the project concept and code structure.
- Explaining p5.js functions and animation techniques.
- Generating and refining parts of the drawing and animation code.
- Debugging movement, masking and layer-order issues.
- Developing and refining the Perlin Noise movement system.
- Improving foreground flower and stem movement.
- Developing the golden flowing-light effect.
- Supporting the integration of different mechanics.
- Organising and editing this README.

### AI Image Generation

OpenAI image generation tools supported visual exploration during concept development.

AI was used to:

- Generate visual mock-ups of the garden's intended appearance.
- Explore colour relationships and abstract visual styles.
- Create interaction illustrations and storyboard references.
- Support the development of visual references for the coded garden.

AI-generated garden imagery also informed the colour and contour development of the coded scene.

### How AI-Assisted Code Works

The AI-assisted animation code stores stable positions and individual movement parameters for garden elements.

Perlin noise calculates smooth movement offsets over time, while random values establish differences between elements during initialisation.

The golden flowing-light effect combines a moving noise-based light field with a mask that restricts the effect to selected golden regions.

The final interactive scene is drawn and animated using p5.js.

### Human Contribution and Review

All AI-assisted code was reviewed, tested and modified by group members to meet the project's visual and technical requirements.

The group made the final design decisions, refined the visual outcomes, resolved integration issues and tested the completed implementation.

AI-assisted sections are identified in the relevant source-code comments, with explanations of their purpose and functionality.

---

## 5. External References

### Artwork Reference

**Klimt, Gustav. *The Italian Garden*. 1913.**

The original painting informed our composition, colour relationships, layered vegetation, decorative shapes and central golden elements.

The artwork image referenced during concept development was accessed through:

https://www.xiaohongshu.com/explore/67ff683f000000001201e48b

### Technical References

**p5.js Official Reference**

https://p5js.org/reference/

Used as a reference for p5.js drawing functions, animation, transformations and interaction.

**p5.js — `noise()`**

https://p5js.org/reference/p5/noise/

Reference for generating smooth, continuous values used in natural movement and the golden flowing-light effect.

**p5.js — `random()`**

https://p5js.org/reference/p5/random/

Reference for random values used to establish individual visual variation.

**p5.js — `createGraphics()`**

https://p5js.org/reference/p5/createGraphics/

Reference for offscreen graphics buffers used to prepare flower sprites and organise drawing layers.

**p5.js — `translate()`**

https://p5js.org/reference/p5/translate/

Reference for applying positional transformations to animated elements.

**p5.js — `rotate()`**

https://p5js.org/reference/p5/rotate/

Reference for rotating flowers and other garden elements during animation.

**p5.sound — `p5.Amplitude`**

https://p5js.org/reference/p5.sound/p5.Amplitude/

Reference for measuring soundtrack amplitude and controlling audio-responsive visual effects.

Any additional external code examples, tutorials or adapted techniques used during development should be acknowledged in the relevant source-code comments.

### Audio Credit

The project uses `P5_project/assets/garden music.mp3` as the soundtrack.

**To be completed before submission:** Soundtrack title, creator, original source URL, and licence or permission details.

---

## 6. Interaction Instructions

### Run Locally

1. Download or clone the complete GitHub repository.
2. Open the `P5_project` folder in Visual Studio Code.
3. Open `index.html` using the Live Server extension.

Alternatively, run the following command from the `P5_project` directory:

```bash
python3 -m http.server 8000
```

Then open:

http://localhost:8000/

Keep the scripts, assets and libraries in their existing folder structure.

### Experience the Garden

| Action | Result |
|---|---|
| Leave the page running | Flowers automatically grow, bloom, fade and repeat. |
| Observe the canopy and flowers | Leaves and flowers sway with different movement strengths. |
| Observe the background | Selected colour blocks move gently, creating subtle depth. |
| Observe the central golden area | Highlights and shadows create a continuous flowing-light effect. |
| Move the mouse across the canvas | Petals and leaves appear, drift, rotate and gradually fade. |
| Click inside the canvas | A flower appears at the cursor position and falls downward. |
| Click **Play music** | The soundtrack plays, and selected flower glows respond to its amplitude. |
| Click **Pause music** | The soundtrack pauses and the audio-responsive glow weakens while other animations continue. |
| Refresh the page | The animation restarts with the fixed-seed garden composition. |

---

## 7. Project Outcome

*The Italian Garden* transforms a static painting into an animated and interactive digital landscape.

Through the combination of audio responsiveness, time-based flower growth, Perlin Noise movement, controlled randomness and user interaction, the project explores how creative coding can reinterpret traditional visual art.

The final composition maintains the original painting's recognisable structure while introducing natural motion, flowing light, temporal changes and opportunities for audience participation.

The project demonstrates how four independently developed p5.js mechanics can be integrated into one cohesive visual experience.

---

## GitHub Repository

**Group E — The Italian Garden**

https://github.com/Yueyue-ylia0725/9103
