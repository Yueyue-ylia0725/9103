NoiseGardenMark.prototype.update = function(t) {
    const amplitude=(NOISE_GARDEN.motion[this.kind]||0)*this.strength;
    this.x=(noise(this.offset,t)-noise(this.offset,0))*amplitude*2;
    this.y=(noise(this.offset+300,t)-noise(this.offset+300,0))*amplitude;
  };

GardenForegroundFlower.prototype.update = function(t) {
    const a=NOISE_GARDEN.motion.foreground*this.strength;
    this.sway =(noise(this.offset, t) - noise(this.offset, 0))* a * 25;
    this.x = this.baseX + this.sway;
    this.y = this.baseY + (noise(this.offset + 300, t) - noise(this.offset + 300, 0)) * a * 2;
    this.rotation = this.baseRotation + this.sway * 0.008;
  };

NoiseGarden.prototype.update = function(dt) {
    this.elapsed+=Math.min(Math.max(dt,0),0.1);
    const t=this.elapsed*NOISE_GARDEN.speed;
    for(const mark of this.moving)mark.update(t);
    for(const flower of this.flowers)flower.update(t);
  };

