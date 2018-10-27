/* exported Renderer3D */
class Renderer3D {

    constructor(canvas) {

        /**
        * Холст.
        * @type {HTMLCanvasElement}
        */
        this.canvas = canvas;

        let gl = this.gl = canvas.getContext('webgl', {premultipliedAlpha: true});

        // Turn on culling. By default backfacing triangles
        // will be culled.
        gl.enable(gl.CULL_FACE);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        this.primitiveType = gl.TRIANGLE_STRIP;

        let programs = this.programs =[
            createProgramFromScripts(gl, ['3d-vertex-shader', '3d-fragment-shader']),
            createProgramFromScripts(gl, ['3d-vertex-shader-light', '3d-fragment-shader-light']),
        ];

        this.locations = [
            {
                // look up where the vertex data needs to go.
                position: gl.getAttribLocation(programs[0], 'a_position'),
                //color: gl.getAttribLocation(programs[0], 'a_vertex_color'),
                normal: gl.getAttribLocation(programs[0], 'a_normal'),

                // lookup uniforms
                worldViewProjection: gl.getUniformLocation(programs[0], 'u_worldViewProjection'),
                world: gl.getUniformLocation(programs[0], "u_world"),
                color: gl.getUniformLocation(programs[0], 'u_color'),
                reverseLightDirection: gl.getUniformLocation(programs[0], 'u_reverseLightDirection'),
            },
            {
                // look up where the vertex data needs to go.
                position: gl.getAttribLocation(programs[1], 'a_position'),
                texcoords: gl.getAttribLocation(programs[1], 'a_texcoord'),

                // lookup uniforms
                worldViewProjection: gl.getUniformLocation(programs[1], 'u_worldViewProjection')
            }
        ];

        // Create a buffer to put positions in
        this.positionBuffer = gl.createBuffer();

        this.colorBuffer = gl.createBuffer();

        this.normalBuffer = gl.createBuffer();

        this.texcoordsBuffer = gl.createBuffer();


        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // Transformations
        this.resetTransform();

        this.resetTexture();

        this.resizeCanvasToDisplaySize();

        this.useProgram(0);

        this.lastUpdate = 0;

        this.alphaEnabled = false;
    }

    useProgram(index) {
        this.programIndex = index;
        this.gl.useProgram(this.programs[index]);
    }

    resetTransform() {
        this.translation = [0, 120, 0];
        this.rotation = [degToRad(25), degToRad(0), 0];
        this.objectRotation = [0, 0, 0];
        this.objectRotationRate = [degToRad(0), degToRad(3), degToRad(0)];
        this.scale = [1, 1, 1];
        this.cameraTranslation = [0, 0, 1100];
        this.cameraUpVector = [0, 1, 0];
        this.targetTranslation = [0, 0, 0];
        this.cameraRotation = [0, 0];
        this.fieldOfView = degToRad(60);
        this.numObjects = 6;
        this.sceneRadius = 600;
        this.zNear = 1;
        this.zFar = 4000;
        this.alphaValue = 150;
    }

    loadTexture(url) {
        let img = new Image();
        let gl = this.gl;

        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
        };

        img.src = url;
        img.setAttribute('crossOrigin', '');
    }

    resetTexture() {
        let gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([66, 66, 66, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    setGeometry(geometry) {
        this.geometry = geometry;
        this._bufferArray(this.positionBuffer, new Float32Array(geometry));
    }

    setColor(color) {
        this.color = [...color, this.alphaEnabled ? this.alphaValue / 255 : 1];
    }

    setNormals(normals) {
        this.normals = normals;
        this._bufferArray(this.normalBuffer, new Float32Array(normals));
    }

    setTexcoords(texcoords) {
        this.texcoords = texcoords;
        this._bufferArray(this.texcoordsBuffer, new Float32Array(texcoords));
    }

    setAlpha(alphaEnabled, value) {
        this.alphaEnabled = alphaEnabled;

        if (value !== undefined) {
            this.alphaValue = value;
        }

        this.setColor(this.color.slice(0, 3));
    }

    _bufferArray(buffer, array, usage = this.gl.STATIC_DRAW) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, array, usage);
    }

    resizeCanvasToDisplaySize() {
        let canvas = this.gl.canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    drawScene(now) {

        let dt = now - this.lastUpdate;

        this._updateObjectRotation(dt);

        this.clearViewport();

        this.gl.useProgram(this.programs[this.programIndex]);

        let locations = this.locations[this.programIndex];

        // Position
        this._setVertexAttrib(locations.position, this.positionBuffer,
            3,             // Кол-во компонент в одной вершине
            this.gl.FLOAT, // Тип данных
            false,         // Нужно ли нормализовывать значения (переводить из 0-255 в 0-1)
            0,             // stride
            0              // offset
        );

        this._setVertexAttrib(locations.normal, this.normalBuffer, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.uniform4fv(locations.color, this.color);

        // set the light direction.
        this.gl.uniform3fv(locations.reverseLightDirection, M4Math.normalize([0.5, 0.7, 0.5]));

        if(locations.texcoords) {
            this._setVertexAttrib(locations.texcoords, this.texcoordsBuffer, 2, this.gl.FLOAT, false, 0, 0);
        }

        let projectionMatrix = this._getProjectionMatrix();
        let viewMatrix = this._getViewMatrix();

        // Compute a view projection matrix
        let viewProjectionMatrix = M4Math.multiply(projectionMatrix, viewMatrix);

        // Выводим объект в точке, в которую направлена камера
        //let targetMatrix = M4Math.translate(viewProjectionMatrix, ...this.targetTranslation);


        let worldMatrix = this._getWorldMatrix();
        //this._drawGeometryAt(locations.worldViewProjection, worldViewProjection, locations.world, worldMatrix);

        for (let i = 0; i < this.numObjects; ++i) {
            this._drawGeometryOnCircle(i, locations.world, worldMatrix, locations.worldViewProjection, viewProjectionMatrix);
        }

        requestAnimationFrame((now) => this.drawScene(now));

        this.lastUpdate = now;
    }

    clearViewport() {
        let gl = this.gl;

        // Clear the canvas.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if(this.alphaEnabled) {
            gl.enable(gl.BLEND);

            gl.disable(gl.DEPTH_TEST);
        }
        else {
            gl.enable(gl.DEPTH_TEST);

            gl.disable(gl.BLEND);
        }
    }

    _updateObjectRotation(dt) {
        for (let i = 0; i < this.objectRotationRate.length; i++) {
            this.objectRotation[i] += this.objectRotationRate[i] * dt * 0.1;
        }
    }

    _setVertexAttrib(location, buffer, size, type, normalize, stride, offset) {
        let gl = this.gl;
        // Turn on the attribute
        gl.enableVertexAttribArray(location);
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        gl.vertexAttribPointer(location, size, type, normalize, stride, offset);
    }

    _drawGeometryOnCircle(i, worldMatrixLocation, worldMatrix, worldViewProjectionLocation, viewProjectionMatrix) {
        let angle = i * Math.PI * 2 / this.numObjects;
        let x = Math.cos(angle) * this.sceneRadius;
        let y = Math.sin(angle) * this.sceneRadius;

        // starting with the view projection matrix
        // compute a matrix for the F
        let curMatrix = M4Math.translate(worldMatrix, x, 0, y);
        curMatrix = M4Math.yRotate(curMatrix, -angle);
        curMatrix = M4Math.xRotate(curMatrix, this.objectRotation[0]);
        curMatrix = M4Math.yRotate(curMatrix, this.objectRotation[1]);
        curMatrix = M4Math.zRotate(curMatrix, this.objectRotation[2]);
        curMatrix = M4Math.scale(curMatrix, ...this.scale);

        let worldViewProjection = M4Math.multiply(viewProjectionMatrix, curMatrix);

        this._drawGeometryAt(worldMatrixLocation, curMatrix, worldViewProjectionLocation, worldViewProjection);
    }

    _drawGeometryAt(worldMatrixLocation, worldMatrix, worldViewProjectionLocation, worldViewProjection) {
        // Set the matrix.
        this.gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjection);
        this.gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);

        // Draw the geometry.
        let offset = 0;
        this.gl.drawArrays(this.primitiveType, offset, this.geometry.length / 3);
    }

    _getProjectionMatrix() {
        let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        return M4Math.perspective(this.fieldOfView, aspect, this.zNear, this.zFar);
    }

    _getViewMatrix() {
        // Use matrix math to compute a position on a circle where
        // the camera is
        let cameraMatrix = M4Math.xRotation(this.cameraRotation[0]);
        cameraMatrix = M4Math.yRotate(cameraMatrix, this.cameraRotation[1]);
        cameraMatrix = M4Math.translate(cameraMatrix, ...this.cameraTranslation);

        // Get the camera's postion from the matrix we computed
        let cameraPosition = [
            cameraMatrix[12],
            cameraMatrix[13],
            cameraMatrix[14],
        ];

        // Compute the camera's matrix using look at.
        cameraMatrix = M4Math.lookAt(cameraPosition, this.targetTranslation, this.cameraUpVector);

        // Make a view matrix from the camera matrix
        return M4Math.inverse(cameraMatrix);
    }

    _getWorldMatrix() {
        let matrix = M4Math.translation(...this.translation);
        matrix = M4Math.xRotate(matrix, this.rotation[0]);
        matrix = M4Math.yRotate(matrix, this.rotation[1]);
        matrix = M4Math.zRotate(matrix, this.rotation[2]);
        return matrix;
    }
}