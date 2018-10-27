/* exported Renderer3D */
class Renderer3D {

    constructor(canvas) {

        this.canvas = canvas;

        let gl = this.gl = canvas.getContext('webgl', {stencil: 8});

        gl.enable(gl.CULL_FACE);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        let program = this.program = createProgramFromScripts(gl, [
            '3d-vertex-shader',
            '3d-fragment-shader'
        ]);

        gl.useProgram(this.program);

        this.locations = {
            position: gl.getAttribLocation(program, 'a_position'),
            normal: gl.getAttribLocation(program, 'a_normal'),
            texcoords: gl.getAttribLocation(program, 'a_texcoord'),

            worldViewProjection: gl.getUniformLocation(program, 'u_worldViewProjection'),
            world: gl.getUniformLocation(program, 'u_world'),
            reverseLightDirection: gl.getUniformLocation(program, 'u_reverseLightDirection'),
            ambientLight: gl.getUniformLocation(program, 'u_ambient_light'),
        };

        this.buffers = {
            position: gl.createBuffer(),
            color: gl.createBuffer(),
            normal: gl.createBuffer(),
            texcoords: gl.createBuffer()
        };

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        this.resetProperties();
        this.resizeViewportToDisplaySize();

        this.lastUpdate = 0;
    }

    resetProperties() {
        this.translation = [0, 120, 0];
        this.rotation = [degToRad(25), degToRad(0), 0];
        this.objectRotation = [0, 0, 0];
        this.objectRotationRate = [degToRad(0), degToRad(3), degToRad(1)];
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
        this.lightDirection = [0.5, 0.7, 0.5];
        this.ambientLight = 0.5;
        this.stencilEnabled = false;
        this.colorMode = this.gl.RGBA;
        this.textureEnabled = false;
        this.alphaEnabled = false;
        this.primitiveType = this.gl.TRIANGLE_STRIP;
    }

    loadTexture(url) {
        let img = new Image();
        let gl = this.gl;

        this.textureUrl = url;

        if(this.textureEnabled) {
            img.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, this.colorMode, this.colorMode,
                    gl.UNSIGNED_BYTE, img);
                gl.generateMipmap(gl.TEXTURE_2D);
            };
        }

        img.src = url;
        img.setAttribute('crossOrigin', '');
    }

    resetTexture() {
        let gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, this.colorMode, 1, 1, 0, this.colorMode,
            gl.UNSIGNED_BYTE, new Uint8Array(this.color));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    setTextureMode(textureEnabled) {
        this.textureEnabled = textureEnabled;

        if(textureEnabled) {
            this.loadTexture(this.textureUrl);
        }
        else {
            this.resetTexture();
        }
    }

    setGeometry(geometry) {
        this.geometry = geometry;
        this._bufferArray(this.buffers.position, new Float32Array(geometry));
    }

    setColor(color) {
        this.color = [...color, this.alphaEnabled ? this.alphaValue : 255];

        if(!this.textureEnabled) {
            this.resetTexture();
        }
    }

    setNormals(normals) {
        this.normals = normals;
        this._bufferArray(this.buffers.normal, new Float32Array(normals));
    }

    setTexcoords(texcoords) {
        this.texcoords = texcoords;
        this._bufferArray(this.buffers.texcoords, new Float32Array(texcoords));
    }

    setAlpha(alphaEnabled, value) {
        this.alphaEnabled = alphaEnabled;

        if (value !== undefined) {
            this.alphaValue = value;
        }

        this.setColor(this.color.slice(0, 3));
    }

    clearViewport() {
        let gl = this.gl;

        // Clear the canvas.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (this.alphaEnabled) {
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
        }
        else {
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.BLEND);
        }
    }

    resizeViewportToDisplaySize() {
        let canvas = this.gl.canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    drawScene(now) {

        let gl = this.gl;
        let dt = now - this.lastUpdate;

        this._updateObjectRotation(dt);

        this.clearViewport();

        let locations = this.locations;

        // Позиция
        this._setVertexAttrib(locations.position, this.buffers.position,
            3,             // Кол-во компонент в одной вершине
            gl.FLOAT,      // Тип данных
            false,         // Нужно ли нормализовывать значения (переводить из 0-255 в 0-1)
            0,             // stride
            0              // offset
        );

        // Нормали
        this._setVertexAttrib(locations.normal, this.buffers.normal, 3, gl.FLOAT, false, 0, 0);

        // Освещение окружения
        gl.uniform1f(locations.ambientLight, this.ambientLight);

        // Направление света
        gl.uniform3fv(locations.reverseLightDirection, M4Math.normalize(this.lightDirection));

        // Координаты текстур
        if(locations.texcoords) {
            this._setVertexAttrib(locations.texcoords, this.buffers.texcoords, 2, gl.FLOAT, false, 0, 0);
        }

        let projectionMatrix = this._getProjectionMatrix();
        let viewMatrix = this._getViewMatrix();
        let worldMatrix = this._getWorldMatrix();
        let targetMatrix = this._getTargetMatrix();
        let viewProjectionMatrix = M4Math.multiply(projectionMatrix, viewMatrix);
        let targetViewProjectionMatrix = M4Math.multiply(viewProjectionMatrix, targetMatrix);

        if(this.stencilEnabled) {
            this._drawAllGeometryWithStencil(worldMatrix, viewProjectionMatrix, targetViewProjectionMatrix);
        }
        else {
            this._drawAllGeometry(worldMatrix, viewProjectionMatrix, targetViewProjectionMatrix);
        }

        requestAnimationFrame((now) => this.drawScene(now));

        this.lastUpdate = now;
    }

    _updateObjectRotation(dt) {
        for (let i = 0; i < this.objectRotationRate.length; i++) {
            this.objectRotation[i] += this.objectRotationRate[i] * dt * 0.1;
        }
    }

    _bufferArray(buffer, array, usage = this.gl.STATIC_DRAW) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, array, usage);
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

    _drawAllGeometry(worldMatrix, viewProjectionMatrix, targetViewProjectionMatrix) {
        let locations = this.locations;

        this._drawGeometryAt(locations.world, M4Math.translation(0, 0, 0),
            locations.worldViewProjection, targetViewProjectionMatrix);

        for (let i = 0; i < this.numObjects; ++i) {
            this._drawGeometryOnCircle(i, locations.world, worldMatrix,
                locations.worldViewProjection, viewProjectionMatrix);
        }
    }

    _drawAllGeometryWithStencil(worldMatrix, viewProjectionMatrix, targetViewProjectionMatrix) {
        let gl = this.gl;
        let locations = this.locations;

        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS, 1, 0xff);
        gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);

        let alpha = this.alphaValue;
        let alphaEnabled = this.alphaEnabled;
        this.setAlpha(true, 0);

        this._drawGeometryAt(locations.world, M4Math.translation(0, 0, 0),
            locations.worldViewProjection, targetViewProjectionMatrix);

        this.setAlpha(alphaEnabled, alpha);

        gl.stencilFunc(gl.EQUAL, 1, 0xff);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        for (let i = 0; i < this.numObjects; ++i) {
            this._drawGeometryOnCircle(i, locations.world, worldMatrix,
                locations.worldViewProjection, viewProjectionMatrix);
        }

        gl.disable(gl.STENCIL_TEST);
    }

    _drawGeometryOnCircle(i, worldMatrixLocation, worldMatrix, worldViewProjectionLocation, viewProjectionMatrix) {
        let angle = i * Math.PI * 2 / this.numObjects;
        let x = Math.cos(angle) * this.sceneRadius;
        let y = Math.sin(angle) * this.sceneRadius;

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

    _getTargetMatrix() {
        let targetMatrix = M4Math.scaling(...this.scale);
        targetMatrix = M4Math.translate(targetMatrix, ...this.targetTranslation);
        return targetMatrix;
    }
}
