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
        let angleInDegrees = value;
        let angleInRadians = angleInDegrees * Math.PI / 180;
        this.rotation[index] = angleInRadians;
        this.drawScene();
    }

    updateScale(index, event, value) {
        this.scale[index] = value;
        this.drawScene();
    }

    updateCameraAngle(event, value) {
        this.cameraAngleRadians = degToRad(value);
        this.drawScene();
    }

    resetTransform() {
        this.translation = this.initialTranslation;
        this.rotation = this.initialRotation;
        this.scale = [1, 1, 1];
        this.cameraAngleRadians = 0;
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

        let numFs = 7;
        let radius = 500;

        // Compute the matrices
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 2000;
        let fieldOfViewRadians = degToRad(60);
        let projectionMatrix = M4Math.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        // Compute the position of the first F
        let fPosition = [300, 100, 0];

        // Use matrix math to compute a position on a circle where
        // the camera is
        let cameraMatrix = M4Math.yRotation(this.cameraAngleRadians);
        cameraMatrix = M4Math.translate(cameraMatrix, 0, 0, radius * 1.5);

        // Get the camera's postion from the matrix we computed
        let cameraPosition = [
            cameraMatrix[12],
            cameraMatrix[13],
            cameraMatrix[14],
        ];

        let up = [0, 1, 0];

        // Compute the camera's matrix using look at.
        cameraMatrix = M4Math.lookAt(cameraPosition, fPosition, up);

        // Make a view matrix from the camera matrix
        let viewMatrix = M4Math.inverse(cameraMatrix);



        // Compute a view projection matrix
        let viewProjectionMatrix = M4Math.multiply(projectionMatrix, viewMatrix);
        let anchorProjectionMatrix = M4Math.translate(viewProjectionMatrix, ...fPosition);
        this.drawGeometryAt(anchorProjectionMatrix);

        viewProjectionMatrix = M4Math.translate(viewProjectionMatrix, ...this.translation);
        viewProjectionMatrix = M4Math.xRotate(viewProjectionMatrix, this.rotation[0]);
        viewProjectionMatrix = M4Math.yRotate(viewProjectionMatrix, this.rotation[1]);
        viewProjectionMatrix = M4Math.zRotate(viewProjectionMatrix, this.rotation[2]);


        for (let i = 0; i < numFs; ++i) {
            let angle = i * Math.PI * 2 / numFs;
            let x = Math.cos(angle) * radius;
            let y = Math.sin(angle) * radius;

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