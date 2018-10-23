window.pageNum = 8;

let canvas = $('#canvas');
let buttonClear = $('#button_clear');
let buttonTriangles = $('#button_triangles');
let buttonLines = $('#button_lines');
let geometry = [
    // top left rect
    170, 54, 0,
    317, 54, 0,
    317, 121, 0,

    170, 54, 0,
    170, 121, 0,
    317, 121, 0,

    // bottom left rect
    242, 421, 0,
    242, 487, 0,
    388, 487, 0,

    242, 421, 0,
    388, 421, 0,
    388, 487, 0,

    // top right rect
    491, 54, 0,
    640, 54, 0,
    640, 121, 0,

    491, 54, 0,
    491, 121, 0,
    640, 121, 0,

    // bottom right rect
    421, 421, 0,
    421, 487, 0,
    568, 487, 0,

    421, 421, 0,
    568, 421, 0,
    568, 487, 0,

    // left column
    209, 121, 0,
    281, 121, 0,
    332, 312, 0,

    209, 121, 0,
    277, 421, 0,
    332, 312, 0,

    // middle left column
    404, 169, 0,
    277, 421, 0,
    355, 421, 0,

    404, 169, 0,
    449, 256, 0,
    355, 421, 0,

    // middle right column
    449, 256, 0,
    533, 421, 0,
    455, 421, 0,

    449, 256, 0,
    404, 334, 0,
    455, 421, 0,

    // right column
    533, 421, 0,
    601, 121, 0,
    529, 121, 0,

    533, 421, 0,
    477, 312, 0,
    529, 121, 0

];

let color = [
    66, 66, 66,
    33, 33, 33,
    97, 97, 97,
];
let mw = canvas.width() / 2;
let mh = canvas.height() / 2;
let renderer = new Renderer3D(canvas[0], geometry, color, [mw, mh, 0], [mw, mh, 0]);
let primitiveType = renderer.gl.TRIANGLES;
renderer.drawScene();
let sliders = setupSliders();

buttonClear.click(() => resetTransform());
buttonTriangles.click(() => setPrimitive(renderer.gl.TRIANGLES));
buttonLines.click(() => setPrimitive(renderer.gl.LINES));

setPrimitive(primitiveType);

function setupSliders() {

    return {

        x: setupSlider('#x', {
            value: renderer.translation[0],
            slide: (...args) => renderer.updatePosition(0, ...args),
            min: -mw,
            max: renderer.gl.canvas.width + mw
        }),

        y: setupSlider('#y', {
            value: renderer.translation[1],
            slide: (...args) => renderer.updatePosition(1, ...args),
            min: -mh,
            max: renderer.gl.canvas.height + mh
        }),

        z: setupSlider('#z', {
            value: renderer.translation[2],
            slide: (...args) => renderer.updatePosition(2, ...args),
            min: -800,
            max: 800
        }),

        angleX: setupSlider('#angleX', {
            value: radToDeg(renderer.rotation[0]),
            slide: (...args) => renderer.updateAngle(0, ...args),
            max: 360,
            name: 'Angle X'
        }),

        angleY: setupSlider('#angleY', {
            value: radToDeg(renderer.rotation[1]),
            slide: (...args) => renderer.updateAngle(1, ...args),
            max: 360,
            name: 'Angle Y'
        }),

        angleZ: setupSlider('#angleZ', {
            value: radToDeg(renderer.rotation[2]),
            slide: (...args) => renderer.updateAngle(2, ...args),
            max: 360,
            name: 'Angle Z'
        }),

        scaleX: setupSlider('#scaleX', {
            value: renderer.scale[0],
            slide: (...args) => renderer.updateScale(0, ...args),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
            name: 'Scale X'
        }),

        scaleY: setupSlider('#scaleY', {
            value: renderer.scale[1],
            slide: (...args) => renderer.updateScale(1, ...args),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
            name: 'Scale Y'
        }),

        scaleZ: setupSlider('#scaleZ', {
            value: renderer.scale[2],
            slide: (...args) => renderer.updateScale(2, ...args),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
            name: 'Scale Z'
        })
    };
}

function resetTransform() {
    setPrimitive(renderer.gl.TRIANGLES);
    for(let key of Object.keys(sliders)) {
        sliders[key].updateValue(sliders[key].defaultValue);
    }
}

function setPrimitive(_primitiveType) {
    primitiveType = _primitiveType;
    let [on, off] = primitiveType === renderer.gl.TRIANGLES ? [buttonTriangles, buttonLines] : [buttonLines, buttonTriangles];
    on.addClass('active');
    off.removeClass('active');
    renderer.primitiveType = primitiveType;
    renderer.drawScene();
}
