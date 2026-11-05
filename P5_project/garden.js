// Garden shapes, colours and drawing setup.
// OpenAI Codex assisted with contour processing, flower rendering and layer handling.

const NOISE_GARDEN = {
  width: 780, height: 1000,
  speed: 0.55,
  motion: { background: 0.25, leaf: 20, flower: 25, foreground: 2 },
  contourTolerance: 2.2,// Contour simplification tolerance (px).
  seamOverlap: 2,// Covers small gaps between shapes.
  maxMovingRegions: 500// Maximum moving colour regions.
};

// Foreground flowers: x, y, size, body colour, centre colour, petals.
const GARDEN_BLOOMS = [
  [20,831,25,'#EF9794','#E2C375',17],
  [72,852,20,'#F7AC27','#E2C375',10],
  [104,869,17,'#F1ACA2','#E3D6C4',12],
  [287,826,29,'#F1ACA2','#E2C375',13],
  [362,820,27,'#EF9794','#E2C375',10],
  [481,827,23,'#C5AB85','#DD919F',8],
  [551,837,35,'#A92E33','#35528E',9],
  [612,791,38,'#F7AC27','#D4A736',12],
  [694,782,35,'#F7AC27','#E29C2F',9],
  [668,854,34,'#F08028','#8C90A9',11],
  [748,895,40,'#F08028','#C5AB85',10],
  [531,932,34,'#F7AC27','#D4A736',10],
  [437,901,29,'#F7AC27','#D4A736',9],
  [515,880,21,'#153B60','#E2C375',10],
  [637,951,26,'#35528E','#ACA253',8],
  [317,932,25,'#35528E','#ACA253',10],
  [310,902,23,'#A92E33','#D4A736',10],
];

// Simplify sampled outlines using the Ramer-Douglas-Peucker algorithm.
// Codex-assisted implementation; reference: Douglas & Peucker (1973), DOI: 10.3138/FM57-6770-U75U-7727.
function gardenContour(flat) {
  const pts=[];
  for(let i=0;i<flat.length;i+=2) pts.push([flat[i],flat[i+1]]);
  function reduce(path) {
    if(path.length<=2)return path;
    const a=path[0],b=path[path.length-1],dx=b[0]-a[0],dy=b[1]-a[1];
    const length=dx*dx+dy*dy;
    let farthest=0,index=0;
    for(let i=1;i<path.length-1;i++){
      const t=length?Math.max(0,Math.min(1,((path[i][0]-a[0])*dx+(path[i][1]-a[1])*dy)/length)):0;
      const d=Math.hypot(path[i][0]-a[0]-t*dx,path[i][1]-a[1]-t*dy);
      if(d>farthest){farthest=d;index=i;}
    }
    return farthest>NOISE_GARDEN.contourTolerance
      ? [...reduce(path.slice(0,index+1)).slice(0,-1),...reduce(path.slice(index))]
      : [a,b];
  }
  // Split the closed outline before simplifying.
  const half=Math.floor(pts.length/2);
  const clean=[...reduce(pts.slice(0,half+1)).slice(0,-1),
    ...reduce([...pts.slice(half),pts[0]]).slice(0,-1)];
  return clean.length>=3?clean:pts;
}

// Bounding box for each painted region.
function gardenBounds(points) {
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  return {left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};
}

// Compare RGB colours when filtering old flower shapes.
function gardenColourDistance(a,b) {
  let distance=0;
  for(const start of [1,3,5])distance+=(parseInt(a.slice(start,start+2),16)-parseInt(b.slice(start,start+2),16))**2;
  return Math.sqrt(distance);
}

class NoiseGardenMark {
  constructor(region) {
    // Region data: colour, type, anchor and outline points.
    const [colour,kind,x,y,flat]=region;
    this.colour=colour;this.kind=kind;this.baseX=x;this.baseY=y;
    this.points=gardenContour(flat);this.bounds=gardenBounds(this.points);
    // Give each region a different noise offset and strength.
    this.offset=random(10000);this.strength=random(0.4,1);
    this.x=0;this.y=0;// Animation offsets.
  }

  // Draw a region, with optional movement.
  display(g,animated=false) {
    const p=this.points,n=p.length;
    g.push();
    g.translate(animated?this.x:0,animated?this.y:0);
    g.fill(this.colour);
    g.stroke(this.colour);
    g.strokeWeight(NOISE_GARDEN.seamOverlap);
    g.strokeJoin(ROUND);
    // Smooth the corners of the sampled shapes.
    g.beginShape();
    g.vertex((p[n-1][0]+p[0][0])/2,(p[n-1][1]+p[0][1])/2);
    for(let i=0;i<n;i++){
      const next=p[(i+1)%n];
      g.quadraticVertex(p[i][0],p[i][1],(p[i][0]+next[0])/2,(p[i][1]+next[1])/2);
    }
    g.endShape(CLOSE);
    g.pop();
  }
}


class GardenForegroundFlower {
  constructor(spec) {
    const [x,y,r,body,centre,petals]=spec;
    this.baseX=x;this.baseY=y;this.radius=r;
    this.offset=random(10000);this.strength=random(0.6,1);
    // Keep the original flower position.
    this.baseX = x;
    this.baseY = y;
    // Random stem length, with a fixed base.
    this.stemLength = random(70, 110);

    this.baseRotation = random(-0.05, 0.05);
    
    this.sway = 0;
    this.rotation = this.baseRotation;
    this.x = x;
    this.y = y;
    this.stemBaseX = x + 3;
    this.stemBaseY = Math.min(1000, y + this.stemLength);
    // Draw each flower once in an off-screen buffer (p5.js createGraphics).
    // Reference: https://p5js.org/reference/p5/createGraphics/
    this.sprite=createGraphics(Math.ceil(r*2+12),Math.ceil(r*2+12));
    const g=this.sprite;g.pixelDensity(2);g.angleMode(RADIANS);
    g.translate(g.width/2,g.height/2);g.noStroke();
    // Slight variations in the flower outline.
    const phase=random(Math.PI*2),rim=[];
    for(let i=0;i<72;i++){
      const a=i/72*Math.PI*2;
      const radius=r*(0.975+0.025*Math.cos(a*petals+phase)+0.03*Math.sin(a*3+phase));
      rim.push([Math.cos(a)*radius,Math.sin(a)*radius]);
    }
    
    g.fill(body);g.beginShape();
    for(let i=-1;i<=rim.length+1;i++)g.curveVertex(...rim[(i+rim.length)%rim.length]);
    g.endShape(CLOSE);
    // Subtle petal shading with lerpColor().
    for(let i=0;i<petals;i++){
      const a=i/petals*Math.PI*2+phase;
      g.push();g.rotate(a);
      g.fill(lerpColor(color(body),color(i%3===0?'#674760':'#E3D6C4'),i%3===0?0.055:0.07));//混合颜色,还得再看看
      g.beginShape();g.vertex(r*0.08,0);
      g.bezierVertex(r*0.30,-r*0.18,r*0.76,-r*0.25,r*0.91,-r*0.06);
      g.bezierVertex(r*0.73,r*0.15,r*0.27,r*0.12,r*0.08,0);
      g.endShape(CLOSE);g.pop();
    }
    g.fill(centre);g.ellipse(-r*0.04,r*0.025,r*0.25,r*0.23);
    g.fill(lerpColor(color(centre),color('#E3D6C4'),0.25));
    g.ellipse(-r*0.075,-r*0.025,r*0.075,r*0.055);
  }



  // Bend the stem towards the moving flower head (Bezier curve).
  displayStem(g) {
    g.push();g.noFill();g.stroke('#436745');g.strokeWeight(3);g.strokeCap(ROUND);
    g.bezier(this.stemBaseX,this.stemBaseY,
      this.stemBaseX,this.stemBaseY-this.stemLength*0.35,
      this.x-this.sway*0.3,this.y+this.stemLength*0.35,this.x,this.y);
    g.pop();
  }

  // Draw the flower head separately from the stem.
  displayHead(g) {
    g.push();g.translate(this.x,this.y);g.rotate(this.rotation);
    g.image(this.sprite,-this.sprite.width/2,-this.sprite.height/2);g.pop();
  }

  display(g) { this.displayStem(g);this.displayHead(g); }
  dispose() { this.sprite.remove(); }

}

class NoiseGarden {
  constructor() {
    this.baseLayer=createGraphics(NOISE_GARDEN.width,NOISE_GARDEN.height);
    this.structureLayer=createGraphics(NOISE_GARDEN.width,NOISE_GARDEN.height);
    this.goldLineLayer=createGraphics(NOISE_GARDEN.width,NOISE_GARDEN.height);
    for(const g of [this.baseLayer,this.structureLayer,this.goldLineLayer]){g.pixelDensity(2);g.angleMode(RADIANS);}
    // Use the same seed for a consistent starting composition.
    this.flowers=[];this.generateGarden(9103);
  }

  // Rebuild the garden from a seed.
  generateGarden(seed=Math.floor(Math.random()*1000000000)) {
    this.seed=seed;this.elapsed=0;
    
    randomSeed(seed);
    if (typeof noiseSeed === "function") noiseSeed(seed);
    for(const flower of this.flowers)flower.dispose();
    this.flowers=GARDEN_BLOOMS.map(spec=>new GardenForegroundFlower(spec));
    // Adjust overlap order for a few foreground flowers.
    this.flowerDrawOrder=this.flowers.slice();
    
    const overlaps=[[317,932,310,902],[531,932,515,880]];
    for(const [frontX,frontY,backX,backY] of overlaps){
      const front=this.flowerDrawOrder.findIndex(f=>f.baseX===frontX && f.baseY===frontY);
      const back=this.flowerDrawOrder.findIndex(f=>f.baseX===backX && f.baseY===backY);
      if(front>=0 && back>=0 && front<back){
        [this.flowerDrawOrder[front],this.flowerDrawOrder[back]]=
          [this.flowerDrawOrder[back],this.flowerDrawOrder[front]];
      }
    }
    const regions=GARDEN_REFERENCE_SHAPES.map(region=>new NoiseGardenMark(region));
    // Replace the original flower shapes with separate sprites.
    this.marks=regions.filter(mark=>!GARDEN_BLOOMS.some(([x,y,r,body])=>{
      const b=mark.bounds;
      return b.right-b.left<r*4.8 && b.bottom-b.top<r*2.8
        && Math.hypot(mark.baseX-x,mark.baseY-y)<r*1.55
        && gardenColourDistance(mark.colour,body)<72;
    }));
    // Codex-assisted selection of painted shapes to cover the stems.
    this.foregroundOccluders=this.marks.filter(mark=>{
      const b=mark.bounds;
      const edge=940+26*Math.exp(-Math.pow((mark.baseX-450)/240,2));
      return mark.baseY>=edge && b.top>=910
        && b.right-b.left<=85 && b.bottom-b.top<=85;
    });
    // Randomly choose 35% of eligible regions for movement.
    this.moving=this.marks.filter(m=>m.kind!=='fixed' && m.points.length<100
      && !GARDEN_BLOOMS.some(([x,y,r])=>Math.hypot(m.baseX-x,m.baseY-y)<r+12))
      .filter(()=>random()<0.35).slice(0,NOISE_GARDEN.maxMovingRegions);
    const g=this.baseLayer;g.background('#A8B38E');
    // Fill gaps left by the removed flower shapes.
    g.noStroke();
    for(let y=735;y<1010;y+=22)for(let x=0;x<800;x+=24){
      g.fill(random(['#436745','#6C8C5D','#A8B38E','#538474']));
      g.rect(x,y,25,23,4);
    }
    // Save the background before drawing the gold.
    this.goldUnderpaint=g.get();
    for(const mark of this.marks)mark.display(g);
    this.goldLineLayer.clear();
    this.drawGold(this.goldLineLayer);
    g.image(this.goldLineLayer,0,0);
    this.structureLayer.clear();
    for(const mark of this.marks)if(mark.kind==='fixed')mark.display(this.structureLayer);
  }

  // Base gold strands; the flowing light effect is in noise-mechanic.js.
  drawGold(g) {
    g.push();g.noFill();g.strokeCap(ROUND);
    
    for(let i=0;i<1;i++){
      const x=240+i*9.3+random(-2,2),end=random(600,805),phase=random(Math.PI*2);
      g.stroke(i%4===0?'#E2C375':'#E29C2F');g.strokeWeight(random(1.9,3.1));
      g.beginShape();
      const points=[];
      for(let y=-20;y<end;y+=18)points.push([x+Math.sin(y*0.021+phase)*random(3,5),y]);
      g.curveVertex(...points[0]);for(const p of points)g.curveVertex(...p);
      g.curveVertex(...points[points.length-1]);g.endShape();
      if(i%3===0){
        const y=random(100,570);
        g.bezier(x,y,x+23,y+10,x+23,y+38,x,y+48);
      }
    }
    g.pop();
  }


  display() {
    push();image(this.baseLayer,0,0,width,height);
    // Scale the reference composition to the current canvas.
    scale(width/NOISE_GARDEN.width,height/NOISE_GARDEN.height);
    for(const mark of this.moving)mark.display(window, typeof this.update === "function");
    image(this.structureLayer,0,0);
    // Animated gold sits behind the foreground flowers.
    if (this.goldFlow) this.goldFlow.display(window);
    // Canopy movement uses separate wind settings.
    if (this.canopyMotion && this.goldFlow) this.canopyMotion.display(window,this);
    // Draw stems before the foreground cover.
    for(const flower of this.flowerDrawOrder)flower.displayStem(window);
    // Cover parts of the stems with existing green shapes.
    for(const mark of this.foregroundOccluders)mark.display(window,this.moving.includes(mark));
    for(const flower of this.flowerDrawOrder)flower.displayHead(window);
    pop();
  }
}