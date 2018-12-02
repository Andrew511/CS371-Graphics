//////////////////////////  Villain class /////////////////////////////////


function Villain(program, x, y, z, degrees, bounding_cir_rad)  {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);

    // Not all of these are used, depending on whether you texture the
    // object or render it with a lighting model
    this.vBuffer = null;
    this.tBuffer = null;
    this.nBuffer = null;
    this.iBuffer = null;
    this.vPosition = null;
    this.vNormal = null;
    this.speed = 1;

    this.rotate = 0;
    
    this.vertices = wolfMesh.vertices[0].values;

    // Normal
    this.normals = wolfMesh.vertices[1].values;

    // Indices of the vertices
    this.indices = wolfMesh.connectivity[0].indices;
    
    // Tex coords
    this.texCoord = [
	1,1, 0,1, 0,0, 1,0,
	0,1, 0,0, 1,0, 1,1,
	0,0, 1,0, 1,1, 0,1,
	1,1, 0,1, 0,0, 1,0,
	1,1, 0,1, 0,0, 1,0,
 	0,0, 1,0, 1,1, 0,1
    ];
    
};

Villain.prototype = Object.create(GameObject.prototype);


Villain.prototype.init = function() {

    this.vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW );

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW );

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

    /*
    this.tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.texCoord), gl.STATIC_DRAW );

    // WebGL guarantees at least eight texture units -- see
    // http://webglstats.com/webgl/parameter/MAX_TEXTURE_IMAGE_UNITS
    
     Texture 0 
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));
    var image0 = new Image();
    image0.crossOrigin = "anonymous";
    image0.src = "fur.png";
    image0.onload = function() { 
	var texture0 = gl.createTexture();
	gl.activeTexture( gl.TEXTURE0);
	gl.bindTexture( gl.TEXTURE_2D, texture0 );
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		      gl.UNSIGNED_BYTE, image0);
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
			  gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    };
     */
    
    
};

Villain.prototype.show = function() {

    g_matrixStack.push(modelViewMatrix);
    //this.rotate = this.rotate + 0.5;
    modelViewMatrix = mult(modelViewMatrix, translate(this.x, 0.0, this.z));
    modelViewMatrix = mult(modelViewMatrix, scalem(0.1,0.1,0.1));
    modelViewMatrix = mult(modelViewMatrix, rotateY(this.degrees - 90));

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
    /*
    gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
    this.vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    if (this.vTexCoord < 0) {
	console.log('Failed to get the storage location of vTexCoord');
    } 
    gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vTexCoord);
    */
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iBuffer );

    gl.enable(gl.CULL_FACE);	
    gl.cullFace(gl.BACK);

    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
     	 1);
/*
     var ambientProduct = mult(la0, gray);
     var diffuseProduct = mult(ld0, gray);
     var specularProduct = mult(ls0, gray); 

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
        flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
        flatten(lp0) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
        me); */

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );


    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(gl.getUniformLocation(program, "texMap"),0);
    //gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    gl.drawElements( gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0 ); 
    gl.disable(gl.CULL_FACE);
    
    modelViewMatrix = g_matrixStack.pop();
    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
    	 0);
    
    // Disable current vertex attribute arrays so those in a different object can be activated
    gl.disableVertexAttribArray(this.vPosition);
    gl.disableVertexAttribArray(this.vNormal);
    gl.disableVertexAttribArray(this.vTexCoord);
};

Villain.prototype.center = function() {
    return vec2(this.x,this.z);
};

Villain.prototype.seek = function(seekPos) {
    var xVec = seekPos[0] - this.x;
    var zVec = seekPos[1] - this.z;

    if (.9 < dot( normalize(vec2(this.xdir, this.zdir)), normalize(vec2(xVec, zVec)))) {
        if (this.speed < 3) {
            this.speed = this.speed + 0.2;
        }
    }
    else {
        this.turn(1);
    }
};

Villain.prototype.slowDown = function() {
    if (this.speed > .8) {
    this.speed = this.speed - .01;
    }

}

//////////////////////////  End Villain's code /////////////////////////////////
