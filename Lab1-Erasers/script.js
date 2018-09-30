window.pageNum = 1;

let canvas = $('#screen');


/* ОЦПИИ */

let color = [216, 27, 96, 255];
let angle = 13;


/* ИНИЦИАЛИЗАЦИЯ */

// Инициализация интервала
let interval = 10;

//document.getElementById('button_clear').addEventListener('click', () => clearScreen());

// Инициализация треугольника в центре экрана
// let hw = canvasWidth / 2;
// let hh = canvasHeight / 2;
// let boundaries = getTriangleBoxBoundaries({ x: 0, y: 0 }, p2, p3);
// let triangleWidth = boundaries[1].x - boundaries[0].x;
// let triangleHeight = boundaries[1].y - boundaries[0].y;
// let offset = { x: hw - triangleWidth / 2, y: hh - triangleHeight / 2 };

let buttons = {
    'fullClear': $('#button_clear_full'),
    'boxClear': $('#button_clear_box'),
    'disabled': $('#button_clear_disabled')
};

for (let m of Object.keys(buttons)) {
    buttons[m].click(() => setMode(m));
}

let canvasInterface = new CanvasInterface(canvas[0], canvas.width(), canvas.height(), color);
canvasInterface.addPolygon([
    { x: 200, y: 200 },
    { x: 15, y: -80 },
    { x: 120, y: 20 }
], angle, 1);
setMode('fullClear');
canvasInterface.setInterval(interval);

canvas.click((event) => addRandomPolygon({ x: event.offsetX, y: event.offsetY }));

let buttonClear = $('#button_clear'); // Кнопка очистки холста
buttonClear.click(() => canvasInterface.reset());

// Устанавливает режим рисования
function setMode(_mode) {
    canvasInterface.eraserType = _mode;

    for(let m of Object.keys(buttons)) {

        if (m == canvasInterface.eraserType) {
            buttons[m].addClass('active');
        }
        else {
            buttons[m].removeClass('active');
        }
    }
}

function addRandomPolygon(p) {
    let ps = [];
    let numPoints = Math.ceil(Math.random() * 4 + 2);
    let minLength = 10;
    let maxLength = 120;

    ps[0] = p;

    for(let i = 1; i < numPoints; i++) {
        ps.push({
            x: getRandomLength(minLength, maxLength),
            y: getRandomLength(minLength, maxLength),
        });
    }

    canvasInterface.addPolygon(ps, Math.random() * 360 - 180, Math.random() * 2 + 1);
}

function getRandomLength(min, max) {
    max = max - min;
    return (Math.random() * max + min) * (Math.random() > 0.5 ? -1 : 1);
}
