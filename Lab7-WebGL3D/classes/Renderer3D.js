/* exported Renderer3D */
class Renderer3D {

    constructor(canvas, geometry, colors, originTranslation, initialTranslation, primitiveType) {

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
        this.resetTransform();
        this.originTranslation = originTranslation || [0, 0, 0];

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

    resetTransform() {
        this.translation = this.initialTranslation || [0, 0, 0];
        this.rotation = [degToRad(40), degToRad(25), degToRad(325)];
        this.scale = [1, 1, 1];
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
        gl.clear(gl.COLOR_BUFFER_BIT);

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
        let matrix;
        matrix = M4Math.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 800);
        matrix = M4Math.translate(matrix, this.translation[0], this.translation[1], this.translation[2]);
        matrix = M4Math.xRotate(matrix, this.rotation[0]);
        matrix = M4Math.yRotate(matrix, this.rotation[1]);
        matrix = M4Math.zRotate(matrix, this.rotation[2]);
        matrix = M4Math.scale(matrix, this.scale[0], this.scale[1], this.scale[2]);
        matrix = M4Math.translate(matrix, -this.originTranslation[0], -this.originTranslation[1], -this.originTranslation[2]);

        // Set the matrix.
        gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Draw the geometry.
        let offset = 0;
        gl.drawArrays(this.primitiveType, offset, this.geometry.length / 3);
    }
}