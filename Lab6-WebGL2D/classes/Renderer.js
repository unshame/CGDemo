/* exported Renderer */
class Renderer {

    constructor(canvas, geometry, color) {

        /**
        * Холст.
        * @type {HTMLCanvasElement}
        */
        this.canvas = canvas;

        let gl = this.gl = canvas.getContext('webgl');

        let program = this.program = createProgramFromScripts(gl, ['2d-vertex-shader', '2d-fragment-shader']);

        // look up where the vertex data needs to go.
        this.positionLocation = gl.getAttribLocation(program, 'a_position');

        // lookup uniforms
        this.colorLocation = gl.getUniformLocation(program, 'u_color');
        this.matrixLocation = gl.getUniformLocation(program, 'u_matrix');

        // Create a buffer to put positions in
        this.positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        // Put geometry data into buffer
        this.setGeometry(geometry);

        // Transformations
        this.translation = [100, 150];
        this.angleInRadians = 0;
        this.scale = [1, 1];
        this.color = color;

        this.updatePosition = (index, event, ui) => {
            this.translation[index] = ui.value;
            this.drawScene();
        };

        this.updateAngle = (event, ui) => {
            let angleInDegrees = 360 - ui.value;
            this.angleInRadians = angleInDegrees * Math.PI / 180;
            this.drawScene();
        };

        this.updateScale = (index, event, ui) => {
            this.scale[index] = ui.value;
            this.drawScene();
        };
    }

    setGeometry(geometry) {
        this.geometry = geometry;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, geometry, this.gl.STATIC_DRAW);
    }

    resizeCanvasToDisplaySize(canvas, multiplier) {
        multiplier = multiplier || 1;
        let width = canvas.clientWidth * multiplier | 0;
        let height = canvas.clientHeight * multiplier | 0;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    }

    drawScene() {
        let gl = this.gl;
        let program = this.program;

        this.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas.
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Turn on the attribute
        gl.enableVertexAttribArray(this.positionLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        {
            let size = 2; // 2 components per iteration
            let type = gl.FLOAT; // the data is 32bit floats
            let normalize = false; // don't normalize the data
            let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
            let offset = 0; // start at the beginning of the buffer
            gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);
        }

        // set the color
        gl.uniform4fv(this.colorLocation, this.color);

        // Compute the matrices
        let matrix = M3Math.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        matrix = M3Math.translate(matrix, this.translation[0], this.translation[1]);
        matrix = M3Math.rotate(matrix, this.angleInRadians);
        matrix = M3Math.scale(matrix, this.scale[0], this.scale[1]);

        // Set the matrix.
        gl.uniformMatrix3fv(this.matrixLocation, false, matrix);

        // Draw the geometry.
        {
            let primitiveType = gl.TRIANGLES;
            let offset = 0;
            gl.drawArrays(primitiveType, offset, this.geometry.length / 2);
        }
    }
}