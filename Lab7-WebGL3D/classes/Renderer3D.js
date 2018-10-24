/* exported Renderer3D */
class Renderer3D {

    constructor(canvas, geometry, colors) {

        /**
        * Холст.
        * @type {HTMLCanvasElement}
        */
        this.canvas = canvas;

        let gl = this.gl = canvas.getContext('webgl');

        this.primitiveType = gl.TRIANGLE_STRIP;

        let program = this.program = createProgramFromScripts(gl, ['3d-vertex-shader', '3d-fragment-shader']);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

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
        this.resetTransform();

        this.resizeCanvasToDisplaySize();
    }


    resetTransform() {
        this.translation = [0, 120, 0];
        this.rotation = [degToRad(25), degToRad(0), 0];
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

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
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
        this.clearViewport();

        // Position
        this.setVertexAttrib(this.positionLocation, this.positionBuffer,
            3,             // Кол-во компонент в одной вершине
            this.gl.FLOAT, // Тип данных
            false,         // Нужно ли нормализовывать значения (переводить из 0-255 в 0-1)
            0,             // stride
            0              // offset
        );

        // Color
        this.setVertexAttrib(this.colorLocation, this.colorBuffer, 3, this.gl.UNSIGNED_BYTE, true, 0, 0);

        let projectionMatrix = this.getProjectionMatrix();
        let viewMatrix = this.getViewMatrix();

        // Compute a view projection matrix
        let viewProjectionMatrix = M4Math.multiply(projectionMatrix, viewMatrix);

        // Выводим объект в точке, в которую направлена камера
        let targetProjectionMatrix = M4Math.translate(viewProjectionMatrix, ...this.targetTranslation);
        this.drawGeometryAt(targetProjectionMatrix);

        let sceneProjectionMatrix = this.calculateSceneMatrix(viewProjectionMatrix);

        for (let i = 0; i < this.numObjects; ++i) {
            this.drawGeometryOnCircle(i, sceneProjectionMatrix);
        }
    }

    clearViewport() {
        let gl = this.gl;

        // Clear the canvas.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Turn on culling. By default backfacing triangles
        // will be culled.
        gl.enable(gl.CULL_FACE);

        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);
    }

    drawGeometryOnCircle(i, matrix) {
        let angle = i * Math.PI * 2 / this.numObjects;
        let x = Math.cos(angle) * this.sceneRadius;
        let y = Math.sin(angle) * this.sceneRadius;

        // starting with the view projection matrix
        // compute a matrix for the F
        let curMatrix = M4Math.translate(matrix, x, 0, y);
        curMatrix = M4Math.yRotate(curMatrix, -angle);
        curMatrix = M4Math.scale(curMatrix, this.scale[0], this.scale[1], this.scale[2]);

        this.drawGeometryAt(curMatrix);
    }

    drawGeometryAt(matrix) {
        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Draw the geometry.
        let offset = 0;
        this.gl.drawArrays(this.primitiveType, offset, this.geometry.length / 3);
    }

    getProjectionMatrix() {
        let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        return M4Math.perspective(this.fieldOfView, aspect, this.zNear, this.zFar);
    }

    getViewMatrix() {
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

    calculateSceneMatrix(matrix) {
        matrix = M4Math.translate(matrix, ...this.translation);
        matrix = M4Math.xRotate(matrix, this.rotation[0]);
        matrix = M4Math.yRotate(matrix, this.rotation[1]);
        matrix = M4Math.zRotate(matrix, this.rotation[2]);
        return matrix;
    }
}