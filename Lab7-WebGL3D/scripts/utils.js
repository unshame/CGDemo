/*
exported
    createProgramFromScripts
    radToDeg
    degToRad
*/

/**
 * Loads a shader.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} shaderSource The shader source.
 * @param {number} shaderType The type of shader.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
function loadShader(gl, shaderSource, shaderType) {
    // Create the shader object
    let shader = gl.createShader(shaderType);

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        let lastError = gl.getShaderInfoLog(shader);
        console.error(`Error compiling shader '${shader}':`, lastError);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 */
function createProgram(gl, shaders, opt_attribs, opt_locations) {
    let program = gl.createProgram();

    shaders.forEach((shader) => {
        gl.attachShader(program, shader);
    });

    if (opt_attribs) {
        opt_attribs.forEach((attrib, ndx) => {
            gl.bindAttribLocation(
                program,
                opt_locations ? opt_locations[ndx] : ndx,
                attrib
            );
        });
    }

    gl.linkProgram(program);

    // Check the link status
    let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        let lastError = gl.getProgramInfoLog(program);
        console.error('Error in program linking:', lastError);

        gl.deleteProgram(program);
        return null;
    }

    return program;
}

/**
 * Loads a shader from a script tag.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} scriptId The id of the script tag.
 * @param {number} opt_shaderType The type of shader. If not passed in it will
 *     be derived from the type of the script tag.
 * @return {WebGLShader} The created shader.
 */
function createShaderFromScript(gl, scriptId, opt_shaderType) {
    let shaderSource = '';
    let shaderType;
    let shaderScript = document.getElementById(scriptId);

    if (!shaderScript) {
        throw (`Error: unknown script element ${scriptId}`);
    }
    shaderSource = shaderScript.text;

    if (!opt_shaderType) {

        if (shaderScript.type === 'x-shader/x-vertex') {
            shaderType = gl.VERTEX_SHADER;
        }
        else if (shaderScript.type === 'x-shader/x-fragment') {
            shaderType = gl.FRAGMENT_SHADER;
        }
        else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
            throw ('Error: unknown shader type');
        }
    }

    return loadShader(gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType);
}

let defaultShaderType = [
    'VERTEX_SHADER',
    'FRAGMENT_SHADER',
];

/**
 * Creates a program from 2 script tags.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderScriptIds Array of ids of the script
 *        tags for the shaders. The first is assumed to be the
 *        vertex shader, the second the fragment shader.
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @return {WebGLProgram} The created program.
 */
function createProgramFromScripts(gl, shaderScriptIds, opt_attribs, opt_locations) {
    let shaders = [];

    for (let i = 0; i < shaderScriptIds.length; ++i) {
        shaders.push(createShaderFromScript(gl, shaderScriptIds[i], gl[defaultShaderType[i]]));
    }

    return createProgram(gl, shaders, opt_attribs, opt_locations);
}


function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}
