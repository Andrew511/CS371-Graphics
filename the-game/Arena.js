//////////////////////////  Arena class /////////////////////////////////

function Arena () {

    this.vertices = [
        0.0,0.0,0.0,
        0.0,0.0,-ARENASIZE,
        0.0,WALLHEIGHT,-ARENASIZE,
        0.0,WALLHEIGHT,0.0,
        ARENASIZE,0.0,0.0,
        ARENASIZE,WALLHEIGHT,0.0,
        ARENASIZE,WALLHEIGHT,-ARENASIZE,
        ARENASIZE,0.0,-ARENASIZE,
        0.0,0.0,-ARENASIZE,
        ARENASIZE,0.0,-ARENASIZE,
        ARENASIZE,WALLHEIGHT,-ARENASIZE,
        0.0,WALLHEIGHT,-ARENASIZE,
        0.0,0.0,0.0,
        0.0,WALLHEIGHT,0.0,
        ARENASIZE,WALLHEIGHT,0.0,
        ARENASIZE,0.0,0.0,
        0.0,0.0,0.0,
        ARENASIZE,0.0,0.0,
        ARENASIZE,0.0,-ARENASIZE,
        0.0,0.0,-ARENASIZE
    ];

    this.normals = [
	1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0
    ];

    this.vBuffer = null;
    this.nBuffer = null;
    this.vPosition = null;
    this.vNormal = null;
    
    this.init = function () {

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW );

	this.nBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW );
	
    };

    this.show = function () {

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

	var ambientProduct = mult(la0, ma);
	var diffuseProduct = mult(ld0, md);
	var specularProduct = mult(ls0, ms);
	
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
	
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); //Left wall
	gl.drawArrays(gl.TRIANGLE_FAN, 4, 4); // right wall

	ambientProduct = mult(la0, yellow);
	diffuseProduct = mult(ld0, yellow);
	specularProduct = mult(ls0, yellow);

	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct1"),
		flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct1"),
		flatten(diffuseProduct) );
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct1"), 
		flatten(specularProduct) );

	gl.drawArrays(gl.TRIANGLE_FAN, 8, 4); //top wall

	ambientProduct = mult(la0, red);
	diffuseProduct = mult(ld0, red);
	specularProduct = mult(ls0, red);

	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct1"),
		flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct1"),
		flatten(diffuseProduct) );
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct1"), 
		flatten(specularProduct) );

	gl.drawArrays(gl.TRIANGLE_FAN, 12, 4); //bottom wall

	ambientProduct = mult(la0, blue);
	//	ambientProduct = mult(vec4(1.0,1.0,1.0,1.0), blue);
	diffuseProduct = mult(ld0, blue);
	specularProduct = mult(ls0, blue);
	
	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct1"),
		      flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct1"),
		      flatten(diffuseProduct) );
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct1"), 
		      flatten(specularProduct) );	
	
	gl.drawArrays(gl.TRIANGLE_FAN, 16, 4); // floor
	// IMPORTANT: Disable current vertex attribute arrays so those in
	// a different object can be activated.  
	gl.disableVertexAttribArray(this.vPosition);
	gl.disableVertexAttribArray(this.vNormal);
    };

};
Arena.prototype.collideLeft = function(obj) {
	var colliding = false;
	if (obj.x - obj.bounding_cir_rad <= 0) {
		oldDirection = normalize(vec3(obj.xdir, 0.0, obj.zdir));
		normal = vec3(1.0,0.0,0.0);
		newDirection = reflect(oldDirection, normal);
		obj.xdir = newDirection[0];
		obj.zdir = newDirection[2];
		obj.degrees = (Math.asin(obj.zdir) * 180) / Math.PI;
		colliding = true;
	}
	return colliding;
};
Arena.prototype.collideRight = function(obj) {
	var colliding = false;
	if (obj.x + obj.bounding_cir_rad >= ARENASIZE) {
		oldDirection = normalize(vec3(obj.xdir, 0.0, obj.zdir));
		normal = vec3(-1.0,0.0,0.0);
		newDirection = reflect(oldDirection, normal);
		obj.xdir = newDirection[0];
		obj.zdir = newDirection[2];
		obj.degrees = -((Math.asin(obj.zdir) * 180) / Math.PI) + 180;
		colliding = true;
	}
	return colliding;
};
Arena.prototype.collideTop = function(obj) {
	var colliding = false;
	if (obj.z + obj.bounding_cir_rad <= -ARENASIZE) {   
		oldDirection = normalize(vec3(obj.xdir, 0.0, obj.zdir));
		normal = vec3(0.0,0.0,1.0);
		newDirection = reflect(oldDirection, normal);
		obj.xdir = newDirection[0];
		obj.zdir = newDirection[2];
		obj.degrees = (Math.acos(obj.xdir) * 180) / Math.PI;
		colliding = true;
	}
	return colliding;
};
Arena.prototype.collideBottom = function(obj) {
	var colliding = false;
	if (obj.z - obj.bounding_cir_rad >= 0) {
		oldDirection = normalize(vec3(obj.xdir, 0.0, obj.zdir));
		normal = vec3(0.0,0.0,-1.0);
		newDirection = reflect(oldDirection, normal);
		obj.xdir = newDirection[0];
		obj.zdir = newDirection[2];
		obj.degrees = -((Math.acos(obj.xdir) * 180) / Math.PI);
		colliding = true;
	} 
	return colliding;
};


//////////////////////////  End Arena object /////////////////////////////////
