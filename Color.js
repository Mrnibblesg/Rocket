//The color constructor allows for easy use and manipulation of rgba color strings.
//red, green, blue, and alpha properties are stored just by the first letter.
//After you change any of them and want to use the new color, use constructCol().
//If you want to create a new color object from an existing rgb or rgba string, use Color.createFromRgba(color),
//where color is the rgb or rgba string, and a new color object will be returned.



//Create a new color. r = red value, g = green value, b = blue value, and a = alpha value.
//The alpha value defaults to 1 (no transparency).
function Color(r,g,b,a=1){
    if (!(typeof r === 'number') || !(typeof g === 'number') || !(typeof b === 'number')){
        
        console.error(`Color constructor requires all rgb values to be numbers!
        (${typeof r}) r: ${r}
        (${typeof g}) g: ${g}
        (${typeof b}) b: ${b}`);
        console.trace();
        return;
        }
        
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    
    //returns colors in an array with 
    //red at index 0, green at 1, blue at 2, alpha at 3 (if alpha exists).
    this.getCols = function(){
        let arr = [this.r,this.g,this.b];
        if (this.a !== undefined){
            arr.push(this.a);
        }
        return arr;
    }
    
    //returns rgba string
    this.constructCol = function(){
        const hasAlpha = !(typeof this.a === 'number');
        return `rgba( ${this.r} , ${this.g} , ${this.b} , ${this.a})`;
    }
    
    this.nearbyColor = function(maxDistAway){
        let newRed = this.r;
        let newGreen = this.g;
        let newBlue = this.b;
        
        const getRand = (col) => col += rand(maxDistAway,-maxDistAway);
        getRand(newRed);
        getRand(newGreen);
        getRand(newBlue);
        if (newRed > 255) {newRed = 255}
        if (newGreen > 255) {newGreen = 255}
        if (newBlue > 255) {newBlue = 255}
        
        if (newRed < 0) {newRed = 0}
        if (newGreen < 0) {newGreen = 0}
        if (newBlue < 0) {newBlue = 0}
        return new Color(newRed,newGreen,newBlue);
    }
}


Color.rgbToString = function(r,g,b){
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}
Color.rgbaToString = function(r,g,b,a){
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

//takes an rgb or rgba string, and returns a color object
Color.createFromRgba = function(rgba){
    rgba = rgba.substring(rgba.indexOf('(')+1,rgba.indexOf(')')).split(',');
    const r = +rgba[0];
    const g = +rgba[1];
    const b = +rgba[2];
    let a;
    if (rgba[3] !== undefined){
        a = +rgba[3];
    }
    else{
        a = 1;
    }
    return new Color(r,g,b,a);
}

Color.random = function(){
    const r = Math.floor(Math.random()*256);
    const g = Math.floor(Math.random()*256);
    const b = Math.floor(Math.random()*256);
    return new Color(r,g,b);
}

//returns a color that, for each r g or b value, can be maxDistAway from the original color.
//ex: createRandomNearbyColor(50,75,100,15) would return a color object with r=47,g=90,b=85.
Color.createRandomNearbyColor = function(r,g,b,maxDistAway){
    const getRand = (col) => col += rand(maxDistAway,-maxDistAway);
    getRand(r);
    getRand(g);
    getRand(b);
    if (r > 255) {r = 255}
    if (g > 255) {g = 255}
    if (b > 255) {b = 255}
    
    if (r < 0) {r = 0}
    if (g < 0) {g = 0}
    if (b < 0) {b = 0}
    
    return new Color(r,g,b);
}


//creates a random bright color with any r, g, or b value greater than dimmest
Color.randomBright = function(dimmest){
    const r = rand(255,dimmest);
    const g = rand(255,dimmest);
    const b = rand(255,dimmest);
    return new Color(r,g,b);
}