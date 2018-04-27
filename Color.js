function Color(r,g,b,a){
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