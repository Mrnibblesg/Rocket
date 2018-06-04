function Emitter(maxParticles, config){
    this.maxParticles = maxParticles;
    this.liveParticles = 0;
    this.config = config;
    
    this.particles = [];
    
    for (let i = 0; i < maxParticles; i++){
        this.particles.push(new Particle(this.config));
    }
    
    this.update = function(){
        for (let i = 0; i < this.liveParticles; i++){
            this.particles[i].update();
            
            if (this.particles[i].life === 0){
                this.removeDead(i);
                i--;
            }
        }
    }
    
    this.emit = function(){
        if (this.liveParticles === this.maxParticles) {return;}
        
        this.particles[this.liveParticles].apply(this.config);
        this.liveParticles++;
    }
    
    this.removeDead = function(index){
        const placeHold = this.particles[index];
        this.particles[index] = this.particles[this.liveParticles];
        this.particles[this.liveParticles] = placeHold;
    }
}