// the-game.js
/*

    By: Andrew Wrege, Starter code provided by Dr. Naps
    Basis for boxmodel code taken from Dr. Naps' example from November 1st.

    --Doggo Soccer
    The goal of this game is exactly like that of regular soccer, however, in this you are playing
    against a friendly canine friend. The goal of which is to score by pushing the 
    modeled soccer ball into the oppossing teams goal, these goals are marked by the yellow and
    red walls on either end of the arena, upon colliding with a wall the player,ball or wolf
    will rebound at an angle appropriate to the direction they were coming in at, 
    When the wolf and player collide into each other, they swap their speed and add a slight
    amount of extra speed to their own, and also swap the direction they were traveling in. 
    When either the player or the villain come into contact with the ball, they kick it,
    Throwing the kickers direction off slightly, and setting the balls speed to the kickers old 
    speed plus a small random amount to simulate the extra power from the kick.
    When the ball reaches on of the goals, both players are reset to their original positions
    along with the ball, and the score of the team opposite of the goal the ball entered is 
    increased by one.

    I also added a secondary light to the game in addition to the player light, the secondary light
     is the most noticeable, with being able to see the specular highlight on the soccer ball
     and other objects in the scene, the player light is most noticeable when entering a corner,
     as it's specular light causes the floor leading into that corner to become a very bright blue


     There are two different mesh objects in the scene, both gotten from 
     https://free3d.com/3d-models/all/1/obj, the first being the wolf that you are
     playing against, and the second being the soccer ball that is being kicked around.
     I have included and wrote code for unique textures for both of these objects being rendered
     using a box-map, however there is in error in my function for allowing it on larger texture sets,
     that causes it to render fine for the first object, but then fail on the second object and after
     I have narrowed down the cause of this issue to line 452, as when it is processing the second module
     that line fails on the first iteration of the for loop, which the causes the mipmapping to
     fail as well. The texture on the wolf, which is the one that is visible if you get close enough
     while it is still or sometimes stuck bouncing off a wall, is a fur texture to give it the
     most realistic pink wolf experience possible.
     (texture can be more easily be seen by removing line 117 from the shader code,
    The wolf will be a normal gray color of the texture then.)

     The second texture, which currently is the one with the previously mentioned rendering issue
     is a texture for the pattern of the soccer ball, which is applied, of course, to the soccer ball.

    The villain(dog) displays intelligent motion by always pursuing the ball, as dogs do
    and as such, even running directly into the player is only a minor setback for the dog
    and its relentless pursuit.

    Attempted GGW Points lines 157, 170 ,241 
    -- Creation of a skybox, current issues involve z fighting with the ground


    Completed GGW Points
    -- Ice Rink
        The Floor is icey! players and villains are unable to fully slow down after the beginning
        of a round, causing them to have wider turn radiuses and think ahead before just
        rushing for the ball across the arena. 

    --Match and Game Timer
        There is also a timer that keeps track of the amount of time that was spent 
        in this current game. and a second timer that keeps track of the current round

        



*/
var gl;
var canvas; 
const WALLHEIGHT     = 70.0; // Some playing field parameters
const ARENASIZE      = 1000.0;
const EYEHEIGHT      = 15.0;
const HERO_VP        = 0.625;


var totalSeconds = 0;
var totalSecondsRound = 0;


const  upx=0.0, upy=1.0, upz=0.0;    // Some LookAt params 

const fov = 60.0;     // Perspective view params 
const near = 1.0;
const far = 10000.0;
var aspect, eyex, eyez;

const width = 1000;       // canvas size 
const height = 625;
const vp1_left = 0;      // Left viewport -- the hero's view 
const vp1_bottom = 0;

var score_red = 0;
var score_yellow = 0;
var redScore;
var yellowScore;

// Lighting stuff
var la0  = [ 0.2,0.2,0.2, 1.0 ]; // light 0 ambient intensity 
var ld0  = [ 1.0,1.0,1.0, 1.0 ]; // light 0 diffuse intensity 
var ls0  = [ 0.0,0.0,0.0, 1.0 ]; // light 0 specular 
var lp0  = [ 0.0,1.0,1.0, 1.0 ]; // light 0 position -- will adjust to hero's viewpoint 
var la1  = [ 0.0,0.0,0.0, 1.0 ]; // light 1 ambient intensity 
var ld1  = [ 1.0,1.0,1.0, 1.0 ]; // light 1 diffuse intensity 
var ls1  = [ 0.0,0.0,1.0, 1.0 ]; // light 1 specular 
var lp1  = [ ARENASIZE/2,100.0,-ARENASIZE/2, 1.0 ]; // light 1 position
var ma   = [ 0.02 , 0.2  , 0.02 , 1.0 ]; // material ambient 
var md   = [ 0.08, 0.6 , 0.08, 1.0 ]; // material diffuse 
var ms   = [ 0.6  , 0.8, 0.6  , 1.0 ]; // material specular 
var me      = 75;             // shininess exponent 
const red  = [ 1.0,0.0,0.0, 1.0 ]; // pure red 
const blue = [ 0.0,0.0,1.0, 1.0 ]; // pure green 
const green = [ 0.0,1.0,0.0, 1.0 ]; // pure blue 
const yellow = [ 1.0,1.0,0.0, 1.0 ]; // pure yellow
const gray = [0.66, 0.66, 0.66, 1.0];

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var program;

var arena;
var hero;
var thingSeeking;
var villain;

var g_matrixStack = []; // Stack for storing a matrix

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    
        gl = WebGLUtils.setupWebGL( canvas );
    //gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    
    gl.clearColor( 0.2, 0.2, 0.2, 1.0 );

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    eyex  =  ARENASIZE/2.0;	// Where the hero starts
    eyez  = -ARENASIZE/4.0;
    aspect=width/height;

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
		 0); // Assume no texturing is the default used in
                     // shader.  If your game object uses it, be sure
                     // to switch it back to 0 for consistency with
                     // those objects that use the defalt.
    
    //gl.enable(gl.DEPTH_TEST); attempt at getting skybox to work
    arena = new Arena(program);
    arena.init();

    hero = new Hero(program, eyex, 0.0, eyez, 270, 10.0);
    hero.init();

    thingSeeking = new ThingSeeking(program, ARENASIZE/2.0, 10.0, -ARENASIZE/2.0, 0, 10.0);
    thingSeeking.init();

    villain = new Villain(program, ARENASIZE/2.0 , 0.0, -(3*ARENASIZE)/4.0, 270, 10.0);
    villain.init();

    //skyBox = new SkyBox(program, ARENASIZE/2.0, -20.0, -ARENASIZE/2.0, 0, 10.0); 
    // lower skybox below arena to prevent z-fighting?
    //skyBox.init();

    redScore = document.getElementById("redScore");
    yellowScore = document.getElementById("yellowScore");
    gl.activeTexture( gl.TEXTURE0 );
    configureCubeMap(0);
    gl.activeTexture(gl.TEXTURE1);
    configureCubeMap(6);
    
    gl.uniform1i(gl.getUniformLocation(program, "texMap"),0);
    gl.uniform1i(gl.getUniformLocation(program, "texMap1"),1);

    var timerVar = setInterval(countTimer, 1000);
    var timerVarRound = setInterval(countTimerRound, 1000);

    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    hero.move(0);
    villain.move(0);
    
    thingSeeking.move(0);

    

    
    // Hero's eye viewport 
    var ambientProduct = mult(la1, gray);
    var diffuseProduct = mult(ld1, gray);
    var specularProduct = mult(ls1, blue);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct2"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct2"),
        flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct2"), 
        flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"), 
        flatten(lp0) );

    gl.viewport( vp1_left, vp1_bottom, (HERO_VP * width), height );
    
    lp0[0] = hero.x + hero.xdir; // Light in front of hero, in line with hero's direction
    lp0[1] = EYEHEIGHT;
    lp0[2] = hero.z + hero.zdir;
    modelViewMatrix = lookAt( vec3(hero.x, EYEHEIGHT, hero.z),
			      vec3(hero.x + hero.xdir, EYEHEIGHT, hero.z + hero.zdir),
			      vec3(upx, upy, upz) );
    projectionMatrix = perspective( fov, HERO_VP * aspect, near, far );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    var normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
    gl.uniformMatrix3fv(gl.getUniformLocation(program, "normalMatrix"), false,
            flatten(normalMatrix) );


    arena.show();
    hero.show();
    thingSeeking.show();
    villain.show();
    //skyBox.show();



    




    // Overhead viewport 
    var horiz_offset = (width * (1.0 - HERO_VP) / 20.0);
    gl.viewport( vp1_left + (HERO_VP * width) + horiz_offset ,
		 vp1_bottom, 18 * horiz_offset, height );
    modelViewMatrix = lookAt(  vec3(500.0,100.0,-500.0),
			       vec3(500.0,0.0,-500.0),
			       vec3(0.0,0.0,-1.0) );
    projectionMatrix = ortho( -500,500, -500,500, 0,200 );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    arena.show();
    hero.show();
    thingSeeking.show();
    villain.show();

    //game logic
    //first test collisions
    arena.collideBottom(villain);
    arena.collideBottom(hero);
    arena.collideBottom(thingSeeking);

    arena.collideTop(villain);
    arena.collideTop(hero);
    arena.collideTop(thingSeeking);

    arena.collideLeft(villain);
    arena.collideLeft(hero);
    arena.collideLeft(thingSeeking);

    arena.collideRight(villain);
    arena.collideRight(hero);
    arena.collideRight(thingSeeking);

    if (collision(villain, hero)) {

        tempDegree = villain.degrees;
        tempxDir = villain.xdir;
        tempzDir = villain.zdir;
        tempspeed = villain.speed;

        villain.xdir = hero.xdir;
        villain.zdir = hero.zdir;
        villain.degrees = hero.degrees
        villain.speed = hero.speed + Math.random();

        hero.xdir = tempxDir;
        hero.zdir = tempzDir;
        hero.degrees = tempDegree
        hero.speed = tempspeed + Math.random();
    }


    if (collision(villain, thingSeeking)) {
        thingSeeking.kick(villain);
        villain.xdir + (Math.random()*15);
        villain.zdir + (Math.random()*15);
    }
    //test hero last to provide extra happy feeling in case of close call on the ball
    // causes game to "lean" in players favor, ball will prioritize going in players
    // direction rather than computers
    if (collision(hero, thingSeeking)) {
        thingSeeking.kick(hero);
    }
    villain.seek(thingSeeking.center());

    modelViewMatrix = lookAt( vec3(hero.x, EYEHEIGHT, hero.z),
    vec3(hero.x + hero.xdir, EYEHEIGHT, hero.z + hero.zdir),
    vec3(upx, upy, upz) );

    thingSeeking.move(thingSeeking.speed);
    villain.move(villain.speed);
    hero.move(hero.speed);

    hero.slowDown();
    villain.slowDown();
    thingSeeking.slowDown();
    if (goal(thingSeeking)) {
        reset();
    }
    


    requestAnimFrame( render );
};

// Key listener

window.onkeydown = function(event) {
    var key = String.fromCharCode(event.keyCode);
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    switch (key) {
    case 'S':
    // Brake
    if (hero.speed > 0.2) {
    hero.speed = hero.speed - .1;
    }
	break;
    case 'W':
    // speed up
    if (hero.speed < 4) {
        hero.speed = hero.speed + 0.3
    }
	break;
    case 'D':
	// Turn left 
	hero.turn(1);
	break;
    case 'A':
	// Turn right 
	hero.turn(-1);
	break;
    }
};

// collision detection

function collision (obj1, obj2) {
    distancex = Math.abs(obj1.x - obj2.x);
    distancez = Math.abs(obj1.z - obj2.z);
    distance = Math.sqrt((distancex * distancex) + (distancez * distancez));
    if (distance < obj1.bounding_cir_rad + obj2.bounding_cir_rad) {
        return true;
    }
    else {
        return false;
    }

};

//check goals

function goal(ball) {
    var isGoal = false;
    if (arena.collideTop(ball)) {
        score_red += 1;
        isGoal = true;
        redScore.value = score_red;
    }
    else if (arena.collideBottom(ball)) {
        score_yellow += 1;
        isGoal = true;
        yellowScore.value = score_yellow;
    }
    return isGoal;
}

// reset positions

function reset() {
    hero.x = eyex;
    hero.z = eyez;
    hero.degrees = 270;
    hero.turn(0);
    hero.speed = 0;

    villain.x = ARENASIZE/2.0;
    villain.z = -(3*ARENASIZE)/4.0;
    villain.degrees = 270;
    villain.speed = 0;

    thingSeeking.x = ARENASIZE/2.0;
    thingSeeking.z = -ARENASIZE/2.0;
    thingSeeking.speed = 0;

    totalSecondsRound = 0;
}

//reflect off a wall
function reflect(inVec, normal) {
    return subtract(inVec, mult(vec3(2.0,2.0,2.0), mult(mult(normal, inVec), normal)));
}

var texture_images = [
    "fur.png", "fur.png", 
    "fur.png", "fur.png", 
    "fur.png", "fur.png",
    "football.png", "football.png", 
    "football.png", "football.png", 
    "football.png", "football.png"
 ];
var cubeMap;
function configureCubeMap(index) { 	// Called to load all textures
    image_count = 0;
    var img = new Array(6);

    for (var i = 0+index; i < 6+index; i++) {
	img[i] = new Image();
	img[i].src = texture_images[i];
	img[i].onload = function() {
            image_count++;
            if (image_count == 6) {
		cubeMap = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
		var targets = [
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                    gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                    gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
		];
		try {
                    for (var j = 0; j < 6; j++) {
			gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    }
		} catch(e) {
		}
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        
            };
	};
    };
}

function countTimer() {
    ++totalSeconds;
    var hour = Math.floor(totalSeconds /3600);
    var minute = Math.floor((totalSeconds - hour*3600)/60);
    var seconds = totalSeconds - (hour*3600 + minute*60);
 
    document.getElementById("timer").innerHTML = hour + ":" + minute + ":" + seconds;
 }


 function countTimerRound() {
    ++totalSecondsRound;
    var hour = Math.floor(totalSecondsRound /3600);
    var minute = Math.floor((totalSecondsRound - hour*3600)/60);
    var seconds = totalSecondsRound - (hour*3600 + minute*60);
 
    document.getElementById("timer2").innerHTML = hour + ":" + minute + ":" + seconds;
 }


