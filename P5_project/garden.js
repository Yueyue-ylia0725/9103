// Shared garden geometry and visual configuration.
const NOISE_GARDEN = {
  width: 780, height: 1000,
  speed: 0.55,
  motion: { background: 0.25, leaf: 15, flower: 16, foreground: 2 },
  contourTolerance: 2.2,
  seamOverlap: 2,
  maxMovingRegions: 500
};

// Explicit flower anchors preserve the existing composition and separate touching
// blooms. Each row is x, y, radius, body colour, centre colour, petal count.
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
  [310,902,23,'#A92E33','#D4A736',10]
];

// Remove pixel-sized stair steps before rounding the larger retained contour.
// This is the Ramer-Douglas-Peucker method: keep points only where a straight
// segment would deviate by more than the configured tolerance in canvas pixels.
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
  const half=Math.floor(pts.length/2);
  const clean=[...reduce(pts.slice(0,half+1)).slice(0,-1),
    ...reduce([...pts.slice(half),pts[0]]).slice(0,-1)];
  return clean.length>=3?clean:pts;
}

function gardenBounds(points) {
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  return {left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};
}

function gardenColourDistance(a,b) {
  let distance=0;
  for(const start of [1,3,5])distance+=(parseInt(a.slice(start,start+2),16)-parseInt(b.slice(start,start+2),16))**2;
  return Math.sqrt(distance);
}

class NoiseGardenMark {
  constructor(region) {
    const [colour,kind,x,y,flat]=region;
    this.colour=colour;this.kind=kind;this.baseX=x;this.baseY=y;
    this.points=gardenContour(flat);this.bounds=gardenBounds(this.points);
    this.offset=random(10000);this.strength=random(0.4,1);
    this.x=0;this.y=0;
  }
  display(g,animated=false) {
    const p=this.points,n=p.length;
    g.push();
    g.translate(animated?this.x:0,animated?this.y:0);
    g.fill(this.colour);
    g.stroke(this.colour);
    g.strokeWeight(NOISE_GARDEN.seamOverlap);
    g.strokeJoin(ROUND);
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
    //Original flower position
    this.baseX = x;
    this.baseY = y;
    //Stem settings from chatgpt
    this.stemLength = random(70, 110);
    // Random initial angle
    this.baseRotation = random(-0.05, 0.05);
    // Animation values
    this.sway = 0;
    this.rotation = this.baseRotation;
    this.x = x;
    this.y = y;
    this.stemBaseX = x + 3;
    this.stemBaseY = Math.min(1000, y + this.stemLength);
    this.sprite=createGraphics(Math.ceil(r*2+12),Math.ceil(r*2+12));
    const g=this.sprite;g.pixelDensity(2);g.angleMode(RADIANS);
    g.translate(g.width/2,g.height/2);g.noStroke();
    const phase=random(Math.PI*2),rim=[];
    for(let i=0;i<72;i++){
      const a=i/72*Math.PI*2;
      const radius=r*(0.975+0.025*Math.cos(a*petals+phase)+0.03*Math.sin(a*3+phase));
      rim.push([Math.cos(a)*radius,Math.sin(a)*radius]);
    }
    // A complete, gently scalloped silhouette makes each bloom readable.
    g.fill(body);g.beginShape();
    for(let i=-1;i<=rim.length+1;i++)g.curveVertex(...rim[(i+rim.length)%rim.length]);
    g.endShape(CLOSE);
    // Low-contrast petal planes preserve the reference's flat painted character.
    // lerpColor mixes neighbouring tones; it does not introduce a new loud hue.
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




  display(g) {
  g.push();
  // Draw the bending stem
  g.noFill();
  g.stroke('#436745');
  g.strokeWeight(3);
  g.strokeCap(ROUND);

  // Stem base remains fixed
  const bottomX = this.stemBaseX;
  const bottomY = this.stemBaseY;

  // Flower head moves with Perlin Noise
  const topX = this.x;
  const topY = this.y;

  // Curved stem using Bezier
  g.bezier(
    bottomX, bottomY,
    bottomX, bottomY - this.stemLength * 0.35,
    topX - this.sway * 0.3,
    topY + this.stemLength * 0.35,
    topX, topY);

  // Draw the flower head at the stem tip
  g.push();

  g.translate(this.x, this.y);
  g.rotate(this.rotation);

  g.image( this.sprite, -this.sprite.width / 2, -this.sprite.height / 2 );

  g.pop();
  g.pop();
  }
  dispose() { this.sprite.remove(); }

}

class NoiseGarden {
  constructor() {
    this.baseLayer=createGraphics(NOISE_GARDEN.width,NOISE_GARDEN.height);
    this.structureLayer=createGraphics(NOISE_GARDEN.width,NOISE_GARDEN.height);
    this.goldLineLayer=createGraphics(NOISE_GARDEN.width,NOISE_GARDEN.height);
    for(const g of [this.baseLayer,this.structureLayer,this.goldLineLayer]){g.pixelDensity(2);g.angleMode(RADIANS);}
    this.flowers=[];this.generateGarden(9103);
  }

  generateGarden(seed=Math.floor(Math.random()*1000000000)) {
    this.seed=seed;this.elapsed=0;
    // p5 seed state is global; coordinate explicit regeneration during integration.
    randomSeed(seed);
    if (typeof noiseSeed === "function") noiseSeed(seed);
    for(const flower of this.flowers)flower.dispose();
    this.flowers=GARDEN_BLOOMS.map(spec=>new GardenForegroundFlower(spec));
    const regions=GARDEN_REFERENCE_SHAPES.map(region=>new NoiseGardenMark(region));
    // Remove old connected flower bodies before drawing the independent blooms.
    // In particular the two yellow flowers must no longer share one silhouette.
    this.marks=regions.filter(mark=>!GARDEN_BLOOMS.some(([x,y,r,body])=>{
      const b=mark.bounds;
      return b.right-b.left<r*4.8 && b.bottom-b.top<r*2.8
        && Math.hypot(mark.baseX-x,mark.baseY-y)<r*1.55
        && gardenColourDistance(mark.colour,body)<72;
    }));
    this.moving=this.marks.filter(m=>m.kind!=='fixed' && m.points.length<100
      && !GARDEN_BLOOMS.some(([x,y,r])=>Math.hypot(m.baseX-x,m.baseY-y)<r+12))
      .filter(()=>random()<0.35).slice(0,NOISE_GARDEN.maxMovingRegions);
    const g=this.baseLayer;g.background('#A8B38E');
    // Green underpainting is visible only where old foreground flowers were removed.
    g.noStroke();
    for(let y=735;y<1010;y+=22)for(let x=0;x<800;x+=24){
      g.fill(random(['#436745','#6C8C5D','#A8B38E','#538474']));
      g.rect(x,y,25,23,4);
    }
    // Preserve the unpainted ground for ghost-free local gold animation.
    this.goldUnderpaint=g.get();
    for(const mark of this.marks)mark.display(g);
    this.goldLineLayer.clear();
    this.drawGold(this.goldLineLayer);
    g.image(this.goldLineLayer,0,0);
    this.structureLayer.clear();
    for(const mark of this.marks)if(mark.kind==='fixed')mark.display(this.structureLayer);
  }

  drawGold(g) {
    g.push();g.noFill();g.strokeCap(ROUND);
    // Continuous strands restore line identity above the sampled gold colour field.
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
    scale(width/NOISE_GARDEN.width,height/NOISE_GARDEN.height);
    for(const mark of this.moving)mark.display(window, typeof this.update === "function");
    image(this.structureLayer,0,0);
    // Gold sway and its matching light mask are drawn below foreground flowers.
    if (this.goldFlow) this.goldFlow.display(window);
    // Foreground flowers draw last, as separate sprites with their own noise motion.
    for(const flower of this.flowers)flower.display(window);
    pop();
  }
}