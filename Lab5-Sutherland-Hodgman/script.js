window.pageNum = 5;

let buttonClip = $('#button_clip'); // Кнопка включения отсечения
let buttonUnclip = $('#button_unclip'); // Кнопка выключения отсечения
let buttonClear = $('#button_clear'); // Кнопка очистки холста
let canvas = $('#canvas'); // Холст для рисования
let clip = false;

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
        { x: 170, y: 54  },
        { x: 317, y: 54  },
        { x: 317, y: 121 },
        { x: 281, y: 121 },
        { x: 332, y: 312 },
        { x: 405, y: 169 },
        { x: 478, y: 312 },
        { x: 529, y: 121 },
        { x: 491, y: 121 },
        { x: 491, y: 54  },
        { x: 640, y: 54  },
        { x: 640, y: 121 },
        { x: 601, y: 121 },
        { x: 533, y: 421 },
        { x: 568, y: 421 },
        { x: 568, y: 487 },
        { x: 421, y: 487 },
        { x: 421, y: 421 },
        { x: 455, y: 421 },
        { x: 405, y: 334 },
        { x: 355, y: 421 },
        { x: 388, y: 421 },
        { x: 388, y: 487 },
        { x: 242, y: 487 },
        { x: 242, y: 421 },
        { x: 277, y: 421 },
        { x: 209, y: 121 },
        { x: 170, y: 121 },
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
