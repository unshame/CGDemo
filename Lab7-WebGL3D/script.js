window.pageNum = 9;

let canvas = $('#canvas');
let buttonClear = $('#button_clear');
let buttonTriangles = $('#button_triangles');
let buttonLines = $('#button_lines');
let buttonMore = $('#button_more');
let buttonTorus = $('#button_torus');
let buttonCylinder = $('#button_cylinder');
let moreControls = $('.buttons.more');
let colors = [
    66, 66, 66,
    33, 33, 33,
    97, 97, 97,
];

const torusProps = [
    100, // radius
    50,  // stripRadius
    30,  // numStrips
    15   // numSections
];

const cylinderProps = [
    100, // radius
    200, // height
    32   // numSides
];

const geometryRef = [
    {
        func: (...args) => Geometry.makeTorus(...args),
        args: torusProps,
        els: $('.torus')
    },
    {
        func: (...args) => Geometry.makeCylinder(...args),
        args: cylinderProps,
        els: $('.cylinder')
    }
];

let renderer = new Renderer3D(canvas[0]);
let primitiveType = renderer.gl.TRIANGLE_STRIP;
let geometryType = 0;
let sliders = setupSliders(renderer);

buttonClear.click(() => resetTransform());
buttonTriangles.click(() => setPrimitive(renderer.gl.TRIANGLE_STRIP));
buttonLines.click(() => setPrimitive(renderer.gl.LINES));
buttonMore.click(() => moreControls.toggleClass('visible'));

buttonTorus.click(() => setGeometryType(0));
buttonCylinder.click(() => setGeometryType(1));

setGeometryType(geometryType);
setPrimitive(primitiveType);
requestAnimationFrame((now) => renderer.drawScene(now));

function resetTransform() {
    setPrimitive(renderer.gl.TRIANGLE_STRIP);
    setGeometryType(0);
    for(let key of Object.keys(sliders)) {
        sliders[key].updateValue(sliders[key].defaultValue);
    }
}

function setPrimitive(_primitiveType) {
    primitiveType = _primitiveType;
    toggleButtons(buttonTriangles, buttonLines, primitiveType === renderer.gl.TRIANGLE_STRIP);
    renderer.primitiveType = primitiveType;
}

function setGeometryType(_geometryType) {
    geometryRef[geometryType].els.hide();
    geometryType = _geometryType;
    toggleButtons(buttonTorus, buttonCylinder, !geometryType);
    updateGeometry();
}

function updateGeometry() {
    let ref = geometryRef[geometryType];
    ref.els.show();
    renderer.setGeometry(ref.func(...ref.args));
    renderer.setColors(colors);
}

function toggleButtons(a, b, cond) {
    let [on, off] = cond ? [a, b] : [b, a];
    on.addClass('active');
    off.removeClass('active');
}
