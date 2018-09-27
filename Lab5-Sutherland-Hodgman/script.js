window.pageNum = 5;

let buttonClip = $('#button_clip'); // Кнопка включения отсечения
let buttonUnclip = $('#button_unclip'); // Кнопка выключения отсечения
let buttonClear = $('#button_clear'); // Кнопка очистки холста
let canvas = $('#canvas'); // Холст для рисования
let clip = false;
//let canvasInterface = new CohenSutherlandCanvas(canvas[0], canvas.width(), canvas.height(), color, true); // Интерфейс для холста

// Очистка по нажатию на крестик
buttonClear.click(() => canvasInterface.clear());

// Смена режима рисования по нажатию на кнопки внизу
buttonClip.click(() => setClip(true));
buttonUnclip.click(() => setClip(false));

let canvasInterface = new SutherlandHodgmanCanvas(
    canvas[0],
    canvas.width(),
    canvas.height(),
    '#689F38',
    '#64DD17',
    '#AED581',
    [
        {x: 230, y: 240},
        {x: 380, y: 140},
        {x: 530, y: 240},
        {x: 530, y: 390},
        {x: 430, y: 390},
        {x: 380, y: 340},
        {x: 330, y: 440},
        {x: 280, y: 340},
        {x: 280, y: 290}
    ],
    clip,
    200
);
let brush = new Brush(canvasInterface);

// События рисование мышью
canvas.mousedown((event) => brush.start(event));
canvas.mousemove((event) => brush.update(event));
canvas.mouseup((event) => brush.end(event));
canvas.mouseout((event) => brush.end(event));

setClip(clip, true);

// Переключает отсечение
function setClip(_clip, fast) {
    clip = _clip;
    let [on, off] = clip ? [buttonClip, buttonUnclip] : [buttonUnclip, buttonClip];
    on.addClass('active');
    off.removeClass('active');
    canvasInterface.clippingEnabled = clip;
    if (fast) {
        canvasInterface.update();
    }
    else {
        canvasInterface.updateStep();
    }
}

