window.pageNum = 8;

let canvas = $('#canvas');
let buttonClear = $('#button_clear');
let buttonTriangles = $('#button_triangles');
let buttonLines = $('#button_lines');
let { vertices } = Geometry.makeTorus(100, 50, 30, 15, 1);
let colors = [
    66, 66, 66,
    33, 33, 33,
    97, 97, 97,
];

let mw = canvas.width() / 2;
let mh = canvas.height() / 2;
let renderer = new Renderer3D(canvas[0], vertices, colors, [0, 0, 0], [0, 0, -500]);
let primitiveType = renderer.gl.TRIANGLE_STRIP;
renderer.drawScene();
let sliders = setupSliders();

buttonClear.click(() => resetTransform());
buttonTriangles.click(() => setPrimitive(renderer.gl.TRIANGLE_STRIP));
buttonLines.click(() => setPrimitive(renderer.gl.LINES));

setPrimitive(primitiveType);

function setupSliders() {

    return {

        x: setupSlider('#x', {
            value: renderer.translation[0],
            slide: (...args) => renderer.updatePosition(0, ...args),
            min: -renderer.gl.canvas.width,
            max: renderer.gl.canvas.width
        }),

        y: setupSlider('#y', {
            value: renderer.translation[1],
            slide: (...args) => renderer.updatePosition(1, ...args),
            min: -renderer.gl.canvas.height,
            max: renderer.gl.canvas.height
        }),

        z: setupSlider('#z', {
            value: renderer.translation[2],
            slide: (...args) => renderer.updatePosition(2, ...args),
            min: -1500,
            max: 0
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
    setPrimitive(renderer.gl.TRIANGLE_STRIP);
    for(let key of Object.keys(sliders)) {
        sliders[key].updateValue(sliders[key].defaultValue);
    }
}

function setPrimitive(_primitiveType) {
    primitiveType = _primitiveType;
    let [on, off] = primitiveType === renderer.gl.TRIANGLE_STRIP ? [buttonTriangles, buttonLines] : [buttonLines, buttonTriangles];
    on.addClass('active');
    off.removeClass('active');
    renderer.primitiveType = primitiveType;
    renderer.drawScene();
}
