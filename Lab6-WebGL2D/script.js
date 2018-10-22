let canvas = $('#canvas');
let geometry = new Float32Array([
    // left column
    0, 0,
    30, 0,
    0, 150,
    0, 150,
    30, 0,
    30, 150,

    // top rung
    30, 0,
    100, 0,
    30, 30,
    30, 30,
    100, 0,
    100, 30,

    // middle rung
    30, 60,
    67, 60,
    30, 90,
    30, 90,
    67, 60,
    67, 90,
]);

let color = [0, 0, 0, 1];

let renderer = new Renderer(canvas[0], geometry, color);
setupSliders(renderer);
renderer.drawScene();

function setupSliders(renderer) {

    setupSlider('#x', {
        value: renderer.translation[0],
        slide: renderer.updatePosition.bind(null, 0),
        max: renderer.gl.canvas.width
    });

    setupSlider('#y', {
        value: renderer.translation[1],
        slide: renderer.updatePosition.bind(null, 1),
        max: renderer.gl.canvas.height
    });

    setupSlider('#angle', {
        slide: renderer.updateAngle,
        max: 360
    });

    setupSlider('#scaleX', {
        value: renderer.scale[0],
        slide: renderer.updateScale.bind(null, 0),
        min: -5,
        max: 5,
        step: 0.01,
        precision: 2
    });

    setupSlider('#scaleY', {
        value: renderer.scale[1],
        slide: renderer.updateScale.bind(null, 1),
        min: -5,
        max: 5,
        step: 0.01,
        precision: 2
    });

}
