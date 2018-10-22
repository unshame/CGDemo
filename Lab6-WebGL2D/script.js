window.pageNum = 8;

let canvas = $('#canvas');
let buttonClear = $('#button_clear');
let buttonTriangles = $('#button_triangles');
let buttonLines = $('#button_lines');
let geometry = [
    // top left rect
    170, 54,
    317, 54,
    317, 121,

    170, 54,
    170, 121,
    317, 121,

    // bottom left rect
    242, 421,
    242, 487,
    388, 487,

    242, 421,
    388, 421,
    388, 487,

    // top right rect
    491, 54,
    640, 54,
    640, 121,

    491, 54,
    491, 121,
    640, 121,

    // bottom right rect
    421, 421,
    421, 487,
    568, 487,

    421, 421,
    568, 421,
    568, 487,

    // left column
    209, 121,
    281, 121,
    332, 312,

    209, 121,
    277, 421,
    332, 312,

    // middle left column
    404, 169,
    277, 421,
    355, 421,

    404, 169,
    449, 256,
    355, 421,

    // middle right column
    449, 256,
    533, 421,
    455, 421,

    449, 256,
    404, 334,
    455, 421,

    // right column
    533, 421,
    601, 121,
    529, 121,

    533, 421,
    477, 312,
    529, 121

];

let color = [
    121 / 255, 85 / 255, 72 / 255, 1,
    141 / 255, 110 / 255, 99 / 255, 1,
    62 / 255, 39 / 255, 35 / 255, 1
];
let mw = canvas.width() / 2;
let mh = canvas.height() / 2;
let renderer = new Renderer(canvas[0], geometry, color, [mw, mh], [mw, mh]);
let primitiveType = renderer.gl.TRIANGLES;
renderer.drawScene();
let sliders = setupSliders();
sliders.angle.updateValue(180);

buttonClear.click(() => resetTransform());
buttonTriangles.click(() => setPrimitive(renderer.gl.TRIANGLES));
buttonLines.click(() => setPrimitive(renderer.gl.LINES));

setPrimitive(primitiveType);

function setupSliders() {

    return {

        x: setupSlider('#x', {
            value: renderer.translation[0],
            slide: renderer.updatePosition.bind(null, 0),
            min: -mw,
            max: renderer.gl.canvas.width + mw
        }),

        y: setupSlider('#y', {
            value: renderer.translation[1],
            slide: renderer.updatePosition.bind(null, 1),
            min: -mh,
            max: renderer.gl.canvas.height + mh
        }),

        angle: setupSlider('#angle', {
            value: 180,
            slide: renderer.updateAngle,
            max: 360
        }),

        scaleX: setupSlider('#scaleX', {
            value: renderer.scale[0],
            slide: renderer.updateScale.bind(null, 0),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
            name: 'Scale X'
        }),

        scaleY: setupSlider('#scaleY', {
            value: renderer.scale[1],
            slide: renderer.updateScale.bind(null, 1),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
            name: 'Scale Y'
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
