//////////////////////////  ThingSeeking class /////////////////////////////////


function ThingSeeking(program, x, y, z, degrees, bounding_cir_rad)  {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);

    this.thingSeekingVertices = soccerMesh.vertices[0].values;

    this.thingSeekingNormals = soccerMesh.vertices[1].values;

    this.thingSeekingIndices = soccerMesh.connectivity[0].indices;

    this.vBuffer = null;
    this.nBuffer = null;
    this.iBuffer = null;
    this.vPosition = null;
    this.vNormal = null;
    this.speed = 0;
    this.rotation = 1;
};

ThingSeeking.prototype = Object.create(GameObject.prototype);

ThingSeeking.prototype.init = function() {
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.thingSeekingVertices), gl.STATIC_DRAW );

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.thingSeekingNormals), gl.STATIC_DRAW );

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.thingSeekingIndices), gl.STATIC_DRAW);
    
};

ThingSeeking.prototype.show = function() {

    g_matrixStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(this.x, 0.0, this.z));
    modelViewMatrix = mult(modelViewMatrix, scalem(5.0,5.0,5.0));
    modelViewMatrix = mult(modelViewMatrix, rotateX(this.speed * this.rotation));
    //modelViewMatrix = mult(modelViewMatrix, rotateZ(this.speed * this.rotation));

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    this.vPosition = gl.getAttribLocation( program, "vPosition" );
    if (this.vPosition < 0) {
	console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( this.vPosition );    

    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    this.vNormal = gl.getAttribLocation( program, "vNormal" );
    if (this.vPosition < 0) {
	console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer( this.vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( this.vNormal );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iBuffer );

    gl.enable(gl.CULL_FACE);	
    gl.cullFace(gl.BACK);

    var ambientProduct = mult(la0, red);
    var diffuseProduct = mult(ld0, red);
    var specularProduct = mult(ls0, red);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct1"),
		  flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct1"),
		  flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct1"), 
		  flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition1"), 
		  flatten(lp0) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
		 me);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),2);

    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(gl.getUniformLocation(program, "texMap1"),1);

    gl.drawElements( gl.TRIANGLES, this.thingSeekingIndices.length, gl.UNSIGNED_SHORT, 0 ); 
    gl.disable(gl.CULL_FACE);


    modelViewMatrix = g_matrixStack.pop();
    // IMPORTANT: Disable current vertex attribute arrays so those in
    // a different object can be activated
    gl.disableVertexAttribArray(this.vPosition);
    gl.disableVertexAttribArray(this.vNormal);
    if (this.rotation > 360) {
        this.rotation = 1;
    }
    else {
        this.rotation += 1;
    }
};

ThingSeeking.prototype.center = function() {
    return vec2(this.x,this.z);
};

ThingSeeking.prototype.slowDown = function() {
    if (this.speed > .1) {
    this.speed = this.speed - .04;
    }
    else {
        this.speed = 0;
    }
}

ThingSeeking.prototype.kick = function(kicker) {
    this.xdir = kicker.xdir;
    this.zdir = kicker.zdir;
    this.speed = kicker.speed * (Math.random()+1);
    this.move(this.speed);
    kicker.turn(Math.floor((Math.random()-2)*4))
}



//////////////////////////  End ThingSeeking's code /////////////////////////////////
