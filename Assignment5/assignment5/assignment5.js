// assign5-starter-code.js

// Assumes vertices for patches and indices of patch pointers into
// those vertices exists in separate files that are loaded in your
// HTML file.

var numDivisions = 20;		// Points computed along each cubic bezier

var points = [];		// Array of points sent to the vertex buffer
var normals = [];

var modelView = [];		// MV matrix
var projection = [];		// Projection matrix

var theta = new Array(3);	// Rotation angle around each axis
theta = [0, 0, 0];

var axis =0;			// Current axis of rotation

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var program;

var flag = true;		// flag to toggle rotation

// Return an array with the Bernstein polys of degree three evaluated
// at u
bezier = function(u) {
    var b =new Array(4);
    var a = 1-u;
    b[3] = a*a*a;
    b[2] = 3*a*a*u;
    b[1] = 3*a*u*u;
    b[0] = u*u*u;
    return b;
}

nbezier = function(u) {
    var b = [];
    b.push(3*u*u);
    b.push(3*u*(2-3*u));
    b.push(3*(1-4*u+3*u*u));
    b.push(-3*(1-u)*(1-u));
    return b;
}



// The data array contains the Bezier mesh points for one patch.  The
// number of points in each direction on the mesh is given by the
// global variable numDivisions.  put_data_to_vb must push the points
// onto the vertex buffer array in the way appropriate for rendering
// each quad.  In its current version, it pushes the points
// corresponding to a quad.
put_data_to_vb = function (data, ndata) {

    for(var i=0; i<numDivisions; i++)
	for(var j =0; j<numDivisions; j++) {
            points.push(data[i][j]);
            normals.push(ndata[i][j]);
	    
            points.push(data[i+1][j]);
            normals.push(ndata[i+1][j]);
	    
            points.push(data[i+1][j+1]);
            normals.push(ndata[i+1][j+1]);
	    
            points.push(data[i][j]);
            normals.push(ndata[i][j]);

            points.push(data[i+1][j+1]);
            normals.push(ndata[i+1][j+1]);
	    
            points.push(data[i][j+1]);
            normals.push(ndata[i][j+1]);
        }
}    

// Compute all 3-D coordinates on the Bezier mesh
compute_patch_points = function () {

    var h = 1.0/numDivisions;

    patch = new Array(numPatches);
    for(var i=0; i<numPatches; i++)
	patch[i] = new Array(16);
    for(var i=0; i<numPatches; i++) 
	// 16 vertices for one cubic Bezier patch
        for(j=0; j<16; j++) {
            patch[i][j] = vec4([vertices[indices[i][j]][0],
				vertices[indices[i][j]][2], 
				vertices[indices[i][j]][1], 1.0]);
	}

    for ( var n = 0; n < numPatches; n++ ) {
	// Compute all data points on one patch
	var data = new Array(numDivisions+1);
	for(var j = 0; j<= numDivisions; j++)
	    data[j] = new Array(numDivisions+1);
	for(var i=0; i<=numDivisions; i++)
	    for(var j=0; j<= numDivisions; j++) { 
		data[i][j] = vec4(0,0,0,1);
		var u = i*h;
		var v = j*h;
		var t = new Array(4);
		for(var ii=0; ii<4; ii++)
		    t[ii]=new Array(4);
		for(var ii=0; ii<4; ii++)
		    for(var jj=0; jj<4; jj++) 
			t[ii][jj] = bezier(u)[ii]*bezier(v)[jj];
		
		for(var ii=0; ii<4; ii++)
		    for(var jj=0; jj<4; jj++) {
			// MV's scale operation will actually do the
			// matrix operation we need evaluate the 3-D
			// analogue of the Bezier matrix on the last
			// slide from November 10 notes
			temp = vec4(patch[n][4*ii+jj]);            
			temp = scale( t[ii][jj], temp);
			// Use MV's add function to add the vec4's
			// data[i][j], which is [0,0,0,1] and temp,
			// which has the first three coordinates we
			// want
			data[i][j] = add(data[i][j], temp);
		    }
	    }

	// Compute normals for this patch

	var ndata = new Array(numDivisions + 1);
	for(var j = 0; j<= numDivisions; j++) ndata[j] = new Array(numDivisions+1);
	var tdata = new Array(numDivisions + 1);
	for(var j = 0; j<= numDivisions; j++) tdata[j] = new Array(numDivisions+1);
	var sdata = new Array(numDivisions + 1);
	for(var j = 0; j<= numDivisions; j++) sdata[j] = new Array(numDivisions+1);
	for(var i=0; i<=numDivisions; i++) for(var j = 0; j <= numDivisions; j++) { 
            ndata[i][j] = vec4(0,0,0,0);
            sdata[i][j] = vec4(0,0,0,0);
            tdata[i][j] = vec4(0,0,0,0);
            var u = i*h;
            var v = j*h;
            var tt = new Array(4);
            for(var ii=0; ii<4; ii++) tt[ii]=new Array(4);
            var ss = new Array(4);
            for(var ii=0; ii<4; ii++) ss[ii]=new Array(4);

            for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++) { 
                tt[ii][jj] = nbezier(u)[ii]*bezier(v)[jj];
                ss[ii][jj] = bezier(u)[ii]*nbezier(v)[jj];
            }

            for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++) {
                var temp = vec4(patch[n][4*ii+jj]); ;            
                temp = scale( tt[ii][jj], temp);
                tdata[i][j] = add(tdata[i][j], temp);
                
                var stemp = vec4(patch[n][4*ii+jj]); ;            
                stemp = scale( ss[ii][jj], stemp);
                sdata[i][j] = add(sdata[i][j], stemp);

            }
            temp = cross(tdata[i][j], sdata[i][j])
            
            ndata[i][j] =  normalize(vec4(temp[0], temp[1], temp[2], 0));
	}  // End normal computation

	// Then push the coordinate and normal points for this patch
	// to the vertex buffer array
	put_data_to_vb(data, ndata);

    }


}


onload = function init()  {
    
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    compute_patch_points();	// Call this to fill the points array
    // with all vertex coordinates on the
    // Bezier mesh
    
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program ); 
       
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    projection = ortho(-2.0, 2.0, -2.0, 2.0, -20, 20);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projection));

    // Light settings 
    var lightPosition = vec4(0.0, 0.0, 20.0, 0.0 );
    var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
    var lightDiffuse = vec4( 0.75, 0.75, 0.75, 1.0 );
    var lightSpecular = vec4( 0.75, 0.75, 0.75, 1.0 );

    var materialAmbient = vec4( 1.0, 0.5, 0.5, 1.0 );
    var materialDiffuse = vec4( 0.75, 0.6, 0.0, 1.0 );
    var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
    var materialShininess = 100.0;
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct ));
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct));	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition ));
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialShininess );

    // End light settings


    render();
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    if(flag) theta[axis] += 0.5;
    
    modelView = mat4();
    
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0]));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0]));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1]));


    gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelView) );
    
    gl.drawArrays( gl.TRIANGLES, 0, points.length);

    requestAnimFrame(render);
}
