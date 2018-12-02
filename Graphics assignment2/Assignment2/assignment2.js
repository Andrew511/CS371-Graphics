// genie-to-circle.js
/*
Functions taken from Dr. Naps' Genie-to-Circle demo program and Fractal display demo program

Extra Functions add in this are scrollbars that control the color of either form of the fractal image,
auto updating colors for the fractals so color is shown even when the fractal is not morphing,
a speed slider to change how quickly the fractal will morph from one to another,
A button to toggle automatic and continuous morphing of the fractals,

Default function is for the fractal to morph when the r key is pressed, as well as changing from one 
color to another.

Author: Andrew Wrege.


*/

// Morph the genie into a circle.  Illustrates tweening with
// interleaved attributes in the vertex buffer
var continuous = false;
var contin = true;
var colors = [];
var gl;
var vertices = [];
var size = 0.25;          // Genie parameter
var tweenLoc;    // Location of the shader's uniform tweening variable
var goingToCircle = true;
var tweenFactor = 0.0;
var canvas;
//ifs stuff
var pMatrix;
var projection;
// colors for color uniforms
var red1;
var red2 ;
var green1;
var green2;
var blue1;
var blue2;

var red1Output;
var red2Output;
var green1Output;
var green2Output;
var blue1Output;
var blue2Output;

//Morph speed var
var speed;
var speedOutput;
// colorloc vars for uniforms
var red1Loc;
var red2Loc;
var green1Loc;
var green2Loc;
var blue1Loc;
var blue2Loc;
// WC window will have to be adjusted based on the fractal's properties
// Those below work for Sierpinski's triangle
var TRI_LEFT = -3.5;
var TRI_RIGHT = 3.75;
var TRI_BOTTOM = -2.5;
var TRI_TOP = 4.0;

// Those below work for the dragon fractal
 var DRAG_LEFT = -10.0;
 var DRAG_RIGHT = 10.0;
 var DRAG_BOTTOM = 0.0;
 var DRAG_TOP = 10.0;

// Number of fractal points to generate
var numpts = 300000;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    
    //    gl = WebGLUtils.setupWebGL( canvas );
    gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" );
    }

    ///////////////// Generate the fractal points //////////////////////////////////////////////
    generateFractalPoints();
    ///////////////// Point generation completed ///////////////////////////////////////////////
    
    //  Configure WebGL
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Manufacture the interleaved genie and circle points
    //genieAndCircle(size);
    //    console.log(sizeof.vec2);     // This outputs 8, which is very
                                        // useful to know below
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer

    var sPosition = gl.getAttribLocation( program, "sPosition" );
    gl.vertexAttribPointer(
        sPosition, // Specifies the index of the generic vertex attribute to be modified.
        2,         // Specifies the number of components per generic vertex attribute. 
                                       // Must be 1, 2, 3, or 4. 
        gl.FLOAT,  // Specifies the data type of each component in the array. 
            // GL_BYTE, GL_UNSIGNED_BYTE, GL_SHORT, GL_UNSIGNED_SHORT, GL_FIXED, or GL_FLOAT. 
        false,     // Specifies whether fixed-point data values should be normalized (GL_TRUE) 
            // or converted directly as fixed-point values (GL_FALSE) when they are accessed.
        16,            // Specifies the byte offset between consecutive generic vertex attributes. 
            // If stride is 0, the generic vertex attributes are understood 
            // to be tightly packed in the array.
        0              // Specifies a pointer to the first component 
            // of the first generic vertex attribute in the array.
                          );
    gl.enableVertexAttribArray( sPosition );    

    var gPosition = gl.getAttribLocation( program, "gPosition" );
    gl.vertexAttribPointer(
        gPosition, // Specifies the index of the generic vertex attribute to be modified.
        2,         // Specifies the number of components per generic vertex attribute. 
                                       // Must be 1, 2, 3, or 4. 
        gl.FLOAT,  // Specifies the data type of each component in the array. 
            // GL_BYTE, GL_UNSIGNED_BYTE, GL_SHORT, GL_UNSIGNED_SHORT, GL_FIXED, or GL_FLOAT. 
        false,     // Specifies whether fixed-point data values should be normalized (GL_TRUE) 
            // or converted directly as fixed-point values (GL_FALSE) when they are accessed.
        16,            // Specifies the byte offset between consecutive generic vertex attributes. 
            // If stride is 0, the generic vertex attributes are understood 
            // to be tightly packed in the array.
        8              // Specifies a pointer to the first component 
            // of the first generic vertex attribute in the array.
                          );
    gl.enableVertexAttribArray(gPosition);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    projection = gl.getUniformLocation(program, "projection");

    tweenLoc = gl.getUniformLocation(program, "tween");
	red1Loc = gl.getUniformLocation(program, "red1h");
	red2Loc = gl.getUniformLocation(program, "red2h");
	green1Loc = gl.getUniformLocation(program, "green1h");
	green2Loc = gl.getUniformLocation(program, "green2h");
	blue1Loc = gl.getUniformLocation(program, "blue1h");
	blue2Loc = gl.getUniformLocation(program, "blue2h");
	
	red1 = document.getElementById("red1Slide");
	red1Output = document.getElementById("red1Val");
	red1Output.innerHTML = red1.value;
	
	red1.oninput = function() {
		red1Output.innerHTML = this.value;
		gl.uniform1f(red1Loc, red1.value);
	}
	green1 = document.getElementById("green1Slide");
	green1Output = document.getElementById("green1Val");
	green1Output.innerHTML = green1.value;
	
	green1.oninput = function() {
		green1Output.innerHTML = this.value;
		gl.uniform1f(green1Loc, green1.value);
	}
	blue1 = document.getElementById("blue1Slide");
	blue1Output = document.getElementById("blue1Val");
	blue1Output.innerHTML = blue1.value;
	
	blue1.oninput = function() {
		blue1Output.innerHTML = this.value;
		gl.uniform1f(blue1Loc, blue1.value);
	}
	
	red2 = document.getElementById("red2Slide");
	red2Output = document.getElementById("red2Val");
	red2Output.innerHTML = red2.value;
	
	red2.oninput = function() {
		red2Output.innerHTML = this.value;
		gl.uniform1f(red2Loc, red2.value);
	}
	green2 = document.getElementById("green2Slide");
	green2Output = document.getElementById("green2Val");
	green2Output.innerHTML = green2.value;
	
	green2.oninput = function() {
		green2Output.innerHTML = this.value;
		gl.uniform1f(green2Loc, green2.value);
	}
	blue2 = document.getElementById("blue2Slide");
	blue2Output = document.getElementById("blue2Val");
	blue2Output.innerHTML = blue2.value;
	
	blue2.oninput = function() {
		blue2Output.innerHTML = this.value;
		gl.uniform1f(blue2Loc, blue2.value);
	}
	
	speed = document.getElementById("morphSpeed");
	speedOutput = document.getElementById("speedVal");
	speedOutput.innerHTML = speed.value;
	
	speed.oninput = function() {
		speedOutput.innerHTML = this.value;
	}
	
	render();
	document.getElementById("continuous").onclick = function(){ continuous = !continuous; if (continuous === true) {contin = true; render();}};
};


function generateFractalPoints() {

    var iter, t;
    var oldx1 = 0;
    var oldy1 = 0;
    var oldx2 = 0;
    var oldy2 = 0;
    var newx1, newy1, newx2, newy2, p;
    var cumulative_prob = [];
    
    cumulative_prob.push(tri.transformations[0].prob);
    for (var i = 1; i < tri.transformations.length; i++)
        cumulative_prob.push(cumulative_prob[i - 1] + tri.transformations[i].prob); // Make probability cumulative

    iter = 0;
    while (iter < numpts) {
        p = Math.random();

        // Select transformation t
        t = 0;
        while ((p > cumulative_prob[t]) && (t < tri.transformations.length - 1)) t++; {

            // Transform point by transformation t 
            newx1 = tri.transformations[t].rotate_scalexx * oldx1
                + tri.transformations[t].rotate_scalexy * oldy1
                + tri.transformations[t].trans_x;
            newy1 = tri.transformations[t].rotate_scaleyx * oldx1
                + tri.transformations[t].rotate_scaleyy * oldy1
                + tri.transformations[t].trans_y;

        }
        cumulative_prob.push(dragon.transformations[0].prob);
        for (var i = 1; i < dragon.transformations.length; i++)
            cumulative_prob.push(cumulative_prob[i - 1] + dragon.transformations[i].prob); // Make probability cumulative

        // Select transformation t
        t = 0;
        while ((p > cumulative_prob[t]) && (t < dragon.transformations.length - 1)) t++; {

        // Transform point by transformation t 
        newx2 = dragon.transformations[t].rotate_scalexx * oldx2
            + dragon.transformations[t].rotate_scalexy * oldy2
            + dragon.transformations[t].trans_x;
        newy2 = dragon.transformations[t].rotate_scaleyx * oldx2
            + dragon.transformations[t].rotate_scaleyy * oldy2
            + dragon.transformations[t].trans_y;
        }

        // Jump around for awhile without plotting to make
        //   sure the first point seen is attracted into the
        //   fractal
        if (iter > 20) {
            vertices.push(vec2(newx1, newy1, 0.0));
            vertices.push(vec2(newx2, newy2, 0.0));
        }
        oldx1 = newx1;
        oldy1 = newy1;
        oldx2 = newx2;
        oldy2 = newy2;
        iter++;
    } 


};



function render() {
	
    gl.clear( gl.COLOR_BUFFER_BIT );
    pMatrix = ortho(((1 - tweenFactor) * TRI_LEFT) + ((tweenFactor) * DRAG_LEFT), ((1 - tweenFactor) * TRI_RIGHT) + ((tweenFactor) * DRAG_RIGHT), ((1 - tweenFactor) * TRI_BOTTOM) + ((tweenFactor) * DRAG_BOTTOM), (((1 - tweenFactor) * TRI_TOP) + ((tweenFactor) * DRAG_TOP)), -1.0, 1.0);
    gl.uniformMatrix4fv(projection, false, flatten(pMatrix));

    if (goingToCircle) {
        tweenFactor = Math.min(tweenFactor + Number(speed.value), 1.0);
        if (tweenFactor >= 1.0)  {
            goingToCircle = false;
			if (continuous === false) {
			contin = false;
			}
            document.getElementById('caption-for-the-goal').innerHTML="Morphing Dragon-to-Triangle";
        }
	
    }
    else {
        tweenFactor = Math.max(tweenFactor - Number(speed.value), 0.0);
        if (tweenFactor <= 0.0) {
            goingToCircle = true;
			if (continuous === false) {
			contin = false;
			}
            document.getElementById('caption-for-the-goal').innerHTML="Morphing Triangle-to-Dragon";
        }           
    }
	
    gl.uniform1f(tweenLoc, tweenFactor);
	gl.uniform1f(red1Loc, red1.value);
	gl.uniform1f(red2Loc, red2.value);
	gl.uniform1f(green1Loc, green1.value);
	gl.uniform1f(green2Loc, green2.value);
	gl.uniform1f(blue1Loc, blue1.value);
	gl.uniform1f(blue2Loc, blue2.value);
    gl.drawArrays( gl.POINTS, 0, vertices.length/2 ); // Why divide by 2?
	
	if (contin === true || continuous === true) {
    requestAnimFrame( render );
	}
	else {
		colorChange();
	}
}

 function colorChange(){
	
	if(contin === false && continuous == false) {
	gl.drawArrays( gl.POINTS, 0, vertices.length/2 );
	requestAnimFrame( colorChange );
	}
}
//Key Listener
window.onkeydown = function(event) {
	var key = String.fromCharCode(event.keyCode);
	switch (key) {
		case 'R' :
		contin = true;
		render();
	}
}


