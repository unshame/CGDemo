/* exported Renderer3D */
class Renderer3D {

    constructor(canvas, geometry, colors, initialTranslation, initialRotation, primitiveType) {

        /**
        * Холст.
        * @type {HTMLCanvasElement}
        */
        this.canvas = canvas;

        let gl = this.gl = canvas.getContext('webgl');

        this.primitiveType = primitiveType === undefined ? gl.TRIANGLES : primitiveType;

        let program = this.program = createProgramFromScripts(gl, ['3d-vertex-shader', '3d-fragment-shader']);

        // look up where the vertex data needs to go.
        this.positionLocation = gl.getAttribLocation(program, 'a_position');
        this.colorLocation = gl.getAttribLocation(program, 'a_vertex_color');

        // lookup uniforms
        this.matrixLocation = gl.getUniformLocation(program, 'u_matrix');

        // Create a buffer to put positions in
        this.positionBuffer = gl.createBuffer();

        // Put geometry data into buffer
        this.setGeometry(geometry);

        this.colorBuffer = gl.createBuffer();
        this.setColors(colors);

        // Transformations
        this.initialTranslation = initialTranslation || [0, 0, 0];
        this.initialRotation = initialRotation || [0, 0, 0];
        this.resetTransform();

        this.resizeCanvasToDisplaySize();
    }

    updatePosition(index, event, value) {
        this.translation[index] = value;
        this.drawScene();
    }

    updateAngle(index, event, value) {
        this.rotation[index] = degToRad(value);
        this.drawScene();
    }

    updateScale(index, event, value) {
        this.scale[index] = value;
        this.drawScene();
    }

    updateCameraPosition(index, event, value) {
        this.cameraTranslation[index] = value;
        this.drawScene();
    }

    updateCameraAngle(index, event, value) {
        this.cameraRotation[index] = degToRad(value);
        this.drawScene();
    }

    updateTargetPosition(index, event, value) {
        this.targetTranslation[index] = value;
        this.drawScene();
    }

    updateFOV(event, value) {
        this.fieldOfView = degToRad(value);
        this.drawScene();
    }

    resetTransform() {
        this.translation = this.initialTranslation;
        this.rotation = this.initialRotation;
        this.scale = [1, 1, 1];
        this.cameraTranslation = [0, 0, 1100];
        this.targetTranslation = [0, 0, 0];
        this.cameraRotation = [0, 0];
        this.fieldOfView = degToRad(60);
        this.numObjects = 6;
        this.sceneRadius = 600;
        this.zNear = 1;
        this.zFar = 4000;
    }

    bufferArray(buffer, array, usage = this.gl.STATIC_DRAW) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, array, usage);
    }

    setGeometry(geometry) {
        this.geometry = geometry;
        this.bufferArray(this.positionBuffer, new Float32Array(geometry));
    }

    setColors(colors) {
        this.colors = [];

        for(let i = 0; i < this.geometry.length / 3; i += colors.length / 3) {
            for(let j = 0; j < colors.length; j++) {
                this.colors.push(colors[j]);
            }
        }

        this.bufferArray(this.colorBuffer, new Uint8Array(this.colors));
    }

    resizeCanvasToDisplaySize() {
        let canvas = this.gl.canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    setVertexAttrib(location, buffer, size, type, normalize, stride, offset) {
        let gl = this.gl;
        // Turn on the attribute
        gl.enableVertexAttribArray(location);
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        gl.vertexAttribPointer(location, size, type, normalize, stride, offset);
    }

    drawScene() {
        let gl = this.gl;
        let program = this.program;

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Turn on culling. By default backfacing triangles
        // will be culled.
        gl.enable(gl.CULL_FACE);

        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        {
            let size = 3; // 3 components per iteration
            let type = gl.FLOAT; // the data is 32bit floats
            let normalize = false; // don't normalize the data
            let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
            let offset = 0; // start at the beginning of the buffer

            // Position
            this.setVertexAttrib(this.positionLocation, this.positionBuffer, size, type, normalize, stride, offset);

            // Color
            size = 3;
            type = gl.UNSIGNED_BYTE;
            normalize = true;
            this.setVertexAttrib(this.colorLocation, this.colorBuffer, size, type, normalize, stride, offset);
        }

        // Compute the matrices
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let projectionMatrix = M4Math.perspective(this.fieldOfView, aspect, this.zNear, this.zFar);

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

        let up = [0, 1, 0];

        // Compute the camera's matrix using look at.
        cameraMatrix = M4Math.lookAt(cameraPosition, this.targetTranslation, up);

        // Make a view matrix from the camera matrix
        let viewMatrix = M4Math.inverse(cameraMatrix);

        // Compute a view projection matrix
        let viewProjectionMatrix = M4Math.multiply(projectionMatrix, viewMatrix);
        let anchorProjectionMatrix = M4Math.translate(viewProjectionMatrix, ...this.targetTranslation);
        this.drawGeometryAt(anchorProjectionMatrix);

        viewProjectionMatrix = M4Math.translate(viewProjectionMatrix, ...this.translation);
        viewProjectionMatrix = M4Math.xRotate(viewProjectionMatrix, this.rotation[0]);
        viewProjectionMatrix = M4Math.yRotate(viewProjectionMatrix, this.rotation[1]);
        viewProjectionMatrix = M4Math.zRotate(viewProjectionMatrix, this.rotation[2]);


        for (let i = 0; i < this.numObjects; ++i) {
            let angle = i * Math.PI * 2 / this.numObjects;
            let x = Math.cos(angle) * this.sceneRadius;
            let y = Math.sin(angle) * this.sceneRadius;

            // starting with the view projection matrix
            // compute a matrix for the F
            let curMatrix = M4Math.translate(viewProjectionMatrix, x, 0, y);
            curMatrix = M4Math.yRotate(curMatrix, -angle);
            curMatrix = M4Math.scale(curMatrix, this.scale[0], this.scale[1], this.scale[2]);

            this.drawGeometryAt(curMatrix);


        }
    }

    drawGeometryAt(matrix) {
        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Draw the geometry.
        let offset = 0;
        this.gl.drawArrays(this.primitiveType, offset, this.geometry.length / 3);
    }
}