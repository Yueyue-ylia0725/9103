// Perlin Noise & Randomness mechanic - Yueyue Liang.
// OpenAI Codex assisted with canopy repainting, gold sway and masked flowing light.
// random() sets individual variations in garden.js; noise() creates movement here.

const CANOPY_MOTION = {
  enabled: true,
  top: 0, bottom: 200,  // Upper leaf area.
  amplitudeX: 15, amplitudeY: 4, // Wind movement range.
  speed: 0.55
};

// Separate wind movement for the upper leaves.
class CanopySway {
  constructor(garden) {
    this.sourceMarks=garden.marks;
    this.selected=new Set(garden.marks.filter(mark=>this.isLeaf(mark)));
    // Include enough space for moving leaves.
    this.height=Math.min(NOISE_GARDEN.height,Math.ceil(Math.max(CANOPY_MOTION.bottom,
      ...Array.from(this.selected,m=>m.bounds.bottom))+40));
    // Offscreen canvas avoids leaving old leaf positions behind.
    this.scene=createGraphics(NOISE_GARDEN.width,this.height);
    this.scene.pixelDensity(2);this.scene.angleMode(RADIANS);
    this.regionMarks=garden.marks.filter(mark=>mark.bounds.top<this.height+30);
  }

  isLeaf(mark) {
    // Select green shapes near the top.
    const c=mark.colour;
    const r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);
    return mark.baseY>=CANOPY_MOTION.top && mark.baseY<=CANOPY_MOTION.bottom
      && mark.bounds.bottom-mark.bounds.top<230
      && g>55 && g>r*0.98 && g>b*1.08;
  }

  update(seconds) {
    const c=CANOPY_MOTION,t=seconds*c.speed;
    for(const mark of this.selected){
      // Neighbouring leaves share a wind field, with gentle individual variation.
      const offset=mark.baseX*0.008+mark.baseY*0.004+500;
      const wind=(noise(offset,t)-noise(offset,0))*2;
      const detail=(noise(mark.offset,t)-noise(mark.offset,0))*2;
      const lift=(noise(offset+300,t)-noise(offset+300,0))*2;
      mark.x=c.enabled?Math.max(-1,Math.min(1,wind*0.8+detail*0.2))*c.amplitudeX*mark.strength:0;
      mark.y=c.enabled?Math.max(-1,Math.min(1,lift))*c.amplitudeY*mark.strength:0;
    }
  }

  display(g,garden) {
    const scene=this.scene,gold=garden.goldFlow;
    scene.clear();scene.push();scene.image(garden.goldUnderpaint,0,0);
    const independent=mark=>this.selected.has(mark)||gold.selected.has(mark);
    // Repaint the area so moving leaves do not overlap static copies.
    for(const mark of this.regionMarks)mark.display(scene,independent(mark));
    scene.image(garden.goldLineLayer,0,0);
    for(const mark of this.regionMarks)if(garden.moving.includes(mark))mark.display(scene,true);
    for(const mark of this.regionMarks)if(mark.kind==='fixed')mark.display(scene,independent(mark));
    gold.displayLight(scene);
    scene.pop();g.image(scene,0,0);
  }

  dispose(){this.scene.remove();}
}

// Gold strands have their own noise movement.
const GOLD_MOTION = {
  enabled: true,
  amplitudeX: 6, 
  amplitudeY: 8,  
  speed: 0.65   
};

// Settings for the moving light over the gold.
const GOLD_FLOW = {
  left: 228, top: 0, width: 194, height: 815,
  speed: 48,             // Downward light speed.
  spatialScale: 0.018,   // Size of the noise patterns.
  horizontalScale: 0.012,
  highlightAlpha: 84, shadowAlpha: 19,
  sampleSize: 4, fps: 25 // Lower resolution for smoother performance.
};

// Codex-assisted flowing light using pixel processing and Canvas masking.
// Canvas 2D compositing reference:
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
class GoldFlowEffect {
  constructor(marks, underpaint, lines, moving) {
    this.sourceMarks = marks;
    this.selected = new Set(marks.filter(mark => this.isGold(mark)));
    this.underpaint = underpaint;
    this.lines = lines;
    this.moving = new Set(moving);
    const c = GOLD_FLOW;
    // Separate buffers for the scene, gold mask and light.
    this.scene = createGraphics(c.width,c.height);
    this.mask = createGraphics(c.width, c.height);
    this.layer = createGraphics(c.width, c.height);
    for (const g of [this.mask, this.layer, this.scene]) {
      g.pixelDensity(1);
      g.angleMode(RADIANS);
    }
    // Calculate light on a smaller image, then scale it up.
    this.field = createImage(Math.ceil(c.width/c.sampleSize), Math.ceil(c.height/c.sampleSize));
    this.regionMarks = marks.filter(mark => {
      const b=mark.bounds,padding=40;
      return b.right>=c.left-padding && b.left<=c.left+c.width+padding && b.top<=c.height+padding;
    });
    this.lastTime = -Infinity;
    this.buildMask(marks);
  }

  // Find gold shapes by position and colour.
  isGold(mark) {
    const c = mark.colour;
    const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
    return mark.baseX >= GOLD_FLOW.left && mark.baseX <= GOLD_FLOW.left+GOLD_FLOW.width
      && mark.baseY >= 0 && mark.baseY <= GOLD_FLOW.height
      && r > 175 && g > 130 && b < 165 && r-b > 65 && r > g*1.025;
  }

  // Mask the light so it only appears on visible gold.
  buildMask(marks) {
    const g = this.mask, c = GOLD_FLOW;
    g.clear();g.push();g.translate(-c.left,-c.top);
    const paint = mark => {
      const b = mark.bounds;
      if (b.right<c.left || b.left>c.left+c.width || b.top>c.height) return;
      // Add gold areas and remove parts covered by other colours.
      g.drawingContext.globalCompositeOperation = this.selected.has(mark)?'source-over':'destination-out';
      mark.display(g, this.selected.has(mark) || this.moving.has(mark));
    };
    for (const mark of this.regionMarks) paint(mark);
    for (const mark of this.regionMarks) if (mark.kind==='fixed') paint(mark);
    g.pop();g.drawingContext.globalCompositeOperation='source-over';
  }

  update(seconds) {
    const c = GOLD_FLOW;
    if (seconds-this.lastTime < 1/c.fps) return;
    this.lastTime = seconds;
    const f = this.field;
    f.loadPixels();
    // Smoothstep gives the light softer edges (Codex-assisted).
    // Formula: https://registry.khronos.org/OpenGL-Refpages/gl4/html/smoothstep.xhtml
    const smooth = (a,b,x) => {
      const t = Math.max(0,Math.min(1,(x-a)/(b-a)));
      return t*t*(3-2*t);
    };
    for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){
      // Perlin noise creates a continuous downward light pattern.
      const value = noise((c.left+x*c.sampleSize)*c.horizontalScale,
        (y*c.sampleSize-seconds*c.speed)*c.spatialScale+1000);
      const bright = smooth(0.43,0.70,value);
      const dark = 1-smooth(0.25,0.43,value);
      // Set RGBA values for the highlight and shadow.
      const i=4*(y*f.width+x);
      const highlight=bright>0;
      f.pixels[i]=highlight?255:151;
      f.pixels[i+1]=highlight?231:103;
      f.pixels[i+2]=highlight?151:33;
      f.pixels[i+3]=Math.round(highlight?bright*c.highlightAlpha:dark*c.shadowAlpha);
    }
    f.updatePixels();
    const g=this.layer;
    g.clear();
    g.drawingContext.imageSmoothingEnabled=true;
    g.image(f,0,0,c.width,c.height);
    this.buildMask(this.sourceMarks);
    this.drawScene();
    // Keep the light inside the gold mask.
    g.drawingContext.globalCompositeOperation='destination-in';
    g.image(this.mask,0,0);
    g.drawingContext.globalCompositeOperation='source-over';
  }

  // Independent Perlin noise movement for the gold shapes.
  updateGoldMotion(seconds) {
    const c=GOLD_MOTION,t=seconds*c.speed;
    for(const mark of this.selected){
      const strength=mark.strength;
      const nx=(noise(mark.offset,t)-noise(mark.offset,0))*2;
      const ny=(noise(mark.offset+300,t)-noise(mark.offset+300,0))*2;
      mark.x=c.enabled?Math.max(-1,Math.min(1,nx))*c.amplitudeX*strength:0;
      mark.y=c.enabled?Math.max(-1,Math.min(1,ny))*c.amplitudeY*strength:0;
    }
  }

  // Redraw the gold area without leaving static copies.
  drawScene() {
    const g=this.scene,c=GOLD_FLOW;
    g.clear();g.push();g.translate(-c.left,-c.top);
    g.image(this.underpaint,0,0);
    // Redraw the local stack from its underpaint, with no old static gold copy.
    for(const mark of this.regionMarks)mark.display(g,this.selected.has(mark));
    g.image(this.lines,0,0);
    for(const mark of this.regionMarks)if(this.moving.has(mark))mark.display(g,true);
    for(const mark of this.regionMarks)if(mark.kind==='fixed')mark.display(g,this.selected.has(mark)||this.moving.has(mark));
    g.pop();
  }

  display(g) {
    g.image(this.scene,GOLD_FLOW.left,GOLD_FLOW.top);
    this.displayLight(g);
  }
  displayLight(g) { g.image(this.layer,GOLD_FLOW.left,GOLD_FLOW.top); }
  dispose() { this.mask.remove();this.layer.remove();this.scene.remove(); }
}

// Add noise animation to the shared garden classes.
// Subtracting noise at time 0 keeps the original starting positions.
NoiseGardenMark.prototype.update = function(t) {
    const amplitude=(NOISE_GARDEN.motion[this.kind]||0)*this.strength;
    this.x=(noise(this.offset,t)-noise(this.offset,0))*amplitude*0.5;
    this.y=(noise(this.offset+300,t)-noise(this.offset+300,0))*amplitude;
  };

// Flower heads sway around their fixed stem bases.
GardenForegroundFlower.prototype.update = function(t) {
    const a=NOISE_GARDEN.motion.foreground*this.strength;
    this.sway =(noise(this.offset, t) - noise(this.offset, 0))* a * 25;
    this.x = this.baseX + this.sway;
    this.y = this.baseY + (noise(this.offset + 300, t) - noise(this.offset + 300, 0)) * a * 2;
    this.rotation = this.baseRotation + this.sway * 0.008;
  };

// Main animation update, called from sketch.js.
NoiseGarden.prototype.update = function(dt) {
    if (!this.canopyMotion || this.canopyMotion.sourceMarks !== this.marks) {
      if (this.canopyMotion) this.canopyMotion.dispose();
      this.canopyMotion = new CanopySway(this);
      this.moving = this.moving.filter(mark => !this.canopyMotion.selected.has(mark));
    }
    if (!this.goldFlow || this.goldFlow.sourceMarks !== this.marks) {
      if (this.goldFlow) this.goldFlow.dispose();
      // Keep gold movement separate from other moving regions.
      const goldMarks=new Set(this.marks.filter(mark=>GoldFlowEffect.prototype.isGold(mark)));
      this.moving=this.moving.filter(mark=>!goldMarks.has(mark));
      this.goldFlow = new GoldFlowEffect(this.marks,this.goldUnderpaint,this.goldLineLayer,[...this.moving,...this.canopyMotion.selected]);
    }
    // Limit large time jumps and update each motion effect.
    this.elapsed+=Math.min(Math.max(dt,0),0.1);
    const t=this.elapsed*NOISE_GARDEN.speed;
    for(const mark of this.moving)mark.update(t);
    for(const flower of this.flowers)flower.update(t);
    this.canopyMotion.update(this.elapsed);
    this.goldFlow.updateGoldMotion(this.elapsed);
    this.goldFlow.update(this.elapsed);
  };

