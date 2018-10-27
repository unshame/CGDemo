window.pageNum = 9;

let canvas = $('#canvas');                    // холст

// Кнопки
let buttonClear = $('#button_clear');         // ресет
let buttonTriangles = $('#button_triangles'); // отрисовка треугольниками
let buttonLines = $('#button_lines');         // отрисовка линиями
let buttonTorus = $('#button_torus');         // объект - тор
let buttonCylinder = $('#button_cylinder');   // объект - цилиндр
let buttonMore = $('#button_more');           // показ остальных слайдеров
let moreControls = $('.buttons.more');        // остальные слайдеры

let buttonModes = $('.button_mode');
let buttonTranslucent = $('#button_translucent');
let buttonOpaque = $('#button_opaque');
let buttonTextured = $('#button_textured');
let buttonUnmasked = $('#button_unmasked');
let buttonMasked = $('#button_masked');

// Цвета вершин
let color = [66 / 255, 66 / 255, 66 / 255];

// Свойства тора
const torusProps = [
    100, // radius
    50,  // stripRadius
    30,  // numStrips
    15   // numSections
];

// Свойства цилиндра
const cylinderProps = [
    100, // radius
    200, // height
    32   // numSides
];

// Объекты для упрощения создания геометрии тора и цилиндра
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
    },
];

let mode = 'opaque';
const modes = {
    opaque: () => {
        renderer.setAlpha(false);
        renderer.useProgram(0);
        buttonOpaque.addClass('active');
    },
    textured: () => {
        renderer.setAlpha(false);
        renderer.useProgram(1);
        $(sliders.texture.elem).show();
        buttonTextured.hide();
        buttonTextured.addClass('active');
    },
    translucent: () => {
        renderer.setAlpha(true);
        renderer.useProgram(0);
        $(sliders.alpha.elem).show();
        buttonTranslucent.hide();
        buttonTranslucent.addClass('active');
    }
};

const textures = [
    './textures/gradient.png',
    './textures/rock.png',
    './textures/face.png',
    './textures/bone.png',
    './textures/tiles.png',
    './textures/what.png',
    './textures/tich.png',
];

// Рендерер
let renderer = new Renderer3D(canvas[0]);

// Режимы отрисовки
const primitiveTypes = [
    renderer.gl.TRIANGLE_STRIP,
    renderer.gl.LINES
];

let primitiveType = primitiveTypes[0];  // Текущие режим отрисовки
let geometryType = 0;                   // Текущий тип объекта
let sliders = setupSliders(renderer, textures);   // Слайдеры

// События при нажатии на кнопки
buttonClear.click(() => resetTransform());
buttonTriangles.click(() => setPrimitive(primitiveTypes[0]));
buttonLines.click(() => setPrimitive(primitiveTypes[1]));
buttonMore.click(() => moreControls.toggleClass('visible'));

buttonTorus.click(() => setGeometryType(0));
buttonCylinder.click(() => setGeometryType(1));
buttonOpaque.click(() => setMode('opaque'));
buttonTextured.click(() => setMode('textured'));
buttonTranslucent.click(() => setMode('translucent'));
buttonMasked.click(() => setStencil(true));
buttonUnmasked.click(() => setStencil(false));

/* Запуск */
setGeometryType(geometryType);
setPrimitive(primitiveType);
setMode(mode);
setStencil(renderer.stencilEnabled);
renderer.resetTexture();
renderer.loadTexture(textures[0]);
requestAnimationFrame((now) => renderer.drawScene(now));


/* Функции */

// Ресетит все настройки
function resetTransform() {
    setPrimitive(primitiveTypes[0]);
    setGeometryType(0);
    setMode('opaque');
    setStencil(false);
    for(let key of Object.keys(sliders)) {
        sliders[key].updateValue(sliders[key].defaultValue);
    }
}

function setMode(_mode) {
    mode = _mode;
    $(sliders.alpha.elem).hide();
    $(sliders.texture.elem).hide();
    buttonModes.show();
    buttonModes.removeClass('active');
    modes[mode]();
}

// Устанавливает режим отрисовки
function setPrimitive(_primitiveType) {
    primitiveType = _primitiveType;
    toggleButtons(buttonTriangles, buttonLines, primitiveType === primitiveTypes[0]);
    renderer.primitiveType = primitiveType;
}

// Устанавливает тип объектов
function setGeometryType(_geometryType) {
    geometryRef[geometryType].els.hide();
    geometryType = _geometryType;
    toggleButtons(buttonTorus, buttonCylinder, geometryType === 0);
    updateGeometry();
}

// Применяет свойства геометрии объектов
function updateGeometry() {
    let ref = geometryRef[geometryType];
    ref.els.show();
    let { vertices, texcoords, normals } = ref.func(...ref.args);
    renderer.setGeometry(vertices);
    renderer.setNormals(normals);
    renderer.setTexcoords(texcoords);
    renderer.setColor(color);
}

function setStencil(stencilEnabled) {
    renderer.stencilEnabled = stencilEnabled;
    toggleButtons(buttonUnmasked, buttonMasked, !stencilEnabled);
}

// Вспомогательная функция для кнопок-переключателей
function toggleButtons(a, b, cond) {
    let [on, off] = cond ? [a, b] : [b, a];
    on.addClass('active');
    off.removeClass('active');
}
