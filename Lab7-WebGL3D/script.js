window.pageNum = 9;

let canvas = $('#canvas');
let buttonClear = $('#button_clear');
let buttonTriangles = $('#button_triangles');
let buttonLines = $('#button_lines');
let buttonMore = $('#button_more');
let moreControls = $('.buttons.more');
let { vertices } = Geometry.makeTorus(100, 50, 30, 15, 1);
let colors = [
    66, 66, 66,
    33, 33, 33,
    97, 97, 97,
];

let renderer = new Renderer3D(canvas[0], vertices, colors);
let primitiveType = renderer.gl.TRIANGLE_STRIP;
renderer.drawScene();
let sliders = setupSliders();

buttonClear.click(() => resetTransform());
buttonTriangles.click(() => setPrimitive(renderer.gl.TRIANGLE_STRIP));
buttonLines.click(() => setPrimitive(renderer.gl.LINES));
buttonMore.click(() => moreControls.toggleClass('visible'));

setPrimitive(primitiveType);

function setupSliders() {

    const minPos = -1500;
    const maxPos = 1500;

    return {

        x: setupSlider('#x', {
            value: renderer.translation[0],
            slide: (...args) => renderer.updatePosition(0, ...args),
            min: minPos,
            max: maxPos
        }),

        y: setupSlider('#y', {
            value: renderer.translation[1],
            slide: (...args) => renderer.updatePosition(1, ...args),
            min: minPos,
            max: maxPos
        }),

        z: setupSlider('#z', {
            value: renderer.translation[2],
            slide: (...args) => renderer.updatePosition(2, ...args),
            min: minPos,
            max: maxPos
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
        }),

        fov: setupSlider('#fov', {
            value: radToDeg(renderer.fieldOfView),
            slide: (...args) => renderer.updateFOV(...args),
            min: 30,
            max: 160,
            name: 'FOV'
        }),

        cameraX: setupSlider('#camX', {
            value: renderer.cameraTranslation[0],
            slide: (...args) => renderer.updateCameraPosition(0, ...args),
            min: minPos,
            max: maxPos,
            name: 'X'
        }),

        cameraY: setupSlider('#camY', {
            value: renderer.cameraTranslation[1],
            slide: (...args) => renderer.updateCameraPosition(1, ...args),
            min: minPos,
            max: renderer.gl.canvas.height,
            name: 'Y'
        }),

        cameraZ: setupSlider('#camZ', {
            value: renderer.cameraTranslation[2],
            slide: (...args) => renderer.updateCameraPosition(2, ...args),
            min: minPos,
            max: maxPos,
            name: 'Z'
        }),

        cameraAngleX: setupSlider('#camAngleX', {
            value: radToDeg(renderer.cameraRotation[0]),
            slide: (...args) => renderer.updateCameraAngle(0, ...args),
            max: 360,
            name: 'Angle X'
        }),

        cameraAngleY: setupSlider('#camAngleY', {
            value: radToDeg(renderer.cameraRotation[1]),
            slide: (...args) => renderer.updateCameraAngle(1, ...args),
            max: 360,
            name: 'Angle Y'
        }),

        targetX: setupSlider('#targetX', {
            value: renderer.targetTranslation[0],
            slide: (...args) => renderer.updateTargetPosition(0, ...args),
            min: minPos,
            max: maxPos,
            name: 'X'
        }),

        targetY: setupSlider('#targetY', {
            value: renderer.targetTranslation[1],
            slide: (...args) => renderer.updateTargetPosition(1, ...args),
            min: minPos,
            max: renderer.gl.canvas.height,
            name: 'Y'
        }),

        targetZ: setupSlider('#targetZ', {
            value: renderer.targetTranslation[2],
            slide: (...args) => renderer.updateTargetPosition(2, ...args),
            min: minPos,
            max: maxPos,
            name: 'Z'
        }),

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
