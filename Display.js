//display
let dis = {
    score: plr.score,
    prevScore: undefined,
    
    lives: plr.lives,
    prevLives: undefined,
    
    //Draw all information
    draw: function(){
        hud.fillStyle = 'white';
        hud.strokeStyle = 'black';
        hud.font = '20px Verdana';
        
        if (this.score != this.prevScore){
            this.prevScore = this.score;
            hud.clearRect(0,0,200,200);
            hud.fillText('Score: '+ this.score,15,15);
        }
        if (this.lives != this.prevLives){
            this.prevLives = this.lives;
            hud.clearRect(W-200,0,200,200);
            hud.fillText('Lives: '+ this.lives,W-185,15);
        }
    },
    updateValues: function(){
        this.lives = plr.lives;
        this.score = plr.score;
    }
}