window.pageNum = 4;

let mode = 'line'; // Режим рисования (line или rectangle)
let clip = true;   // Включено ли отсечение
let buttonLine = $('#button_line'); // Кнопка переключения в режим линии
let buttonRectangle = $('#button_rectangle'); // Кнопка переключения в режим окружности
let buttonClip = $('#button_clip'); // Кнопка включения отсечения
let buttonUnclip = $('#button_unclip'); // Кнопка выключения отсечения
let buttonClear = $('#button_clear'); // Кнопка очистки холста
let canvas = $('#canvas'); // Холст для рисования

let color = [0, 150, 136, 255]; // Цвет кисти
let canvasInterface = new CohenSutherlandCanvas(canvas[0], canvas.width(), canvas.height(), color, true); // Интерфейс для холста
let brush = new Brush(canvasInterface, mode); // Кисть

// Ставим стандартный режим рисования (линия)
setMode('line');

// Включаем отсечение
setClip(true);

// События рисование мышью
canvas.mousedown((event) => brush.start(event));
canvas.mousemove((event) => brush.update(event));
canvas.mouseup((event) => brush.end(event));
canvas.mouseout((event) => brush.end(event));
canvas.bind('touchstart', (event) => brush.start(convertToBrushEvent(event, canvas)));
canvas.bind('touchmove', (event) => brush.update(convertToBrushEvent(event, canvas)));
canvas.bind('touchcancel', (event) => brush.end(convertToBrushEvent(event, canvas)));
canvas.bind('touchend', (event) => brush.end(convertToBrushEvent(event, canvas)));

// Очистка по нажатию на крестик
buttonClear.click(() => canvasInterface.clear());

// Смена режима рисования по нажатию на кнопки внизу
buttonLine.click(() => setMode('line'));
buttonRectangle.click(() => setMode('rectangle'));

// Переключение отсечения
buttonClip.click(() => setClip(true));
buttonUnclip.click(() => setClip(false));

canvasInterface.add('line', { x: 0, y: 0 }, { x: 800, y: 540 });
canvasInterface.add('line', { x: 0, y: 540 }, { x: 800, y: 0 });
canvasInterface.update();

// Устанавливает режим рисования
function setMode(_mode) {
    mode = _mode;
    let [on, off] = mode == 'line' ? [buttonLine, buttonRectangle] : [buttonRectangle, buttonLine];
    on.addClass('active');
    off.removeClass('active');
    brush.setType(mode);
}

// Переключает отсечение
function setClip(_clip) {
    clip = _clip;
    let [on, off] = clip ? [buttonClip, buttonUnclip] : [buttonUnclip, buttonClip];
    on.addClass('active');
    off.removeClass('active');
    canvasInterface.clippingEnabled = clip;
    canvasInterface.update();
}
