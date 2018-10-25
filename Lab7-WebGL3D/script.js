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
let buttonTranslucent = $('#button_translucent');
let buttonOpaque = $('#button_opaque');
let alphaSlider = $('#alpha');

// Цвета вершин
let colors = [
    66, 66, 66,
    33, 33, 33,
    97, 97, 97,
];

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
    }
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
let sliders = setupSliders(renderer);   // Слайдеры

// События при нажатии на кнопки
buttonClear.click(() => resetTransform());
buttonTriangles.click(() => setPrimitive(primitiveTypes[0]));
buttonLines.click(() => setPrimitive(primitiveTypes[1]));
buttonMore.click(() => moreControls.toggleClass('visible'));

buttonTorus.click(() => setGeometryType(0));
buttonCylinder.click(() => setGeometryType(1));
buttonTranslucent.click(() => setAlpha(true));
buttonOpaque.click(() => setAlpha(false));

/* Запуск */
setGeometryType(geometryType);
setPrimitive(primitiveType);
setAlpha(renderer.alphaEnabled);
requestAnimationFrame((now) => renderer.drawScene(now));


/* Функции */

// Ресетит все настройки
function resetTransform() {
    setPrimitive(primitiveTypes[0]);
    setGeometryType(0);
    setAlpha(false);
    for(let key of Object.keys(sliders)) {
        sliders[key].updateValue(sliders[key].defaultValue);
    }
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
    renderer.setGeometry(ref.func(...ref.args));
    renderer.setColors(colors);
}

function setAlpha(alphaEnabled, value) {
    toggleButtons(buttonTranslucent, buttonOpaque, alphaEnabled);

    if(alphaEnabled) {
        buttonTranslucent.hide();
        alphaSlider.show();
    }
    else {
        buttonTranslucent.show();
        alphaSlider.hide();
    }

    renderer.setAlpha(alphaEnabled, value);
}

// Вспомогательная функция для кнопок-переключателей
function toggleButtons(a, b, cond) {
    let [on, off] = cond ? [a, b] : [b, a];
    on.addClass('active');
    off.removeClass('active');
}
