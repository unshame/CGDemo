window.pageNum = 1;

let canvas = $('#screen');

let color = [216, 27, 96, 255];
let angle = 13;
let interval = 10;

let buttons = {
    'fullClear': $('#button_clear_full'),
    'boxClear': $('#button_clear_box'),
    'disabled': $('#button_clear_disabled')
};

for (let m of Object.keys(buttons)) {
    buttons[m].click(() => setMode(m));
}

let canvasInterface = new CanvasInterface(canvas[0], canvas.width(), canvas.height(), color);
let polygon = canvasInterface.addPolygon([
    { x: 200, y: 200 },
    { x: 15, y: -80 },
    { x: 120, y: 20 }
], angle, 600);
polygon.setResizeProperties(true, 1, 2, 0.5, 1);
setMode('fullClear');
canvasInterface.setInterval(interval);

canvas.click((event) => addRandomPolygon({ x: event.offsetX, y: event.offsetY }));

let buttonClear = $('#button_clear');
buttonClear.click(() => canvasInterface.reset());

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

    let polygon = canvasInterface.addPolygon(ps, Math.random() * 360 - 180, Math.random() * 500 + 100);
    polygon.setResizeProperties(true, 0.5, 1.5, Math.random() * 0.9 + 0.1, Math.random() > 0.5 ? -1 : 1);
}

function getRandomLength(min, max) {
    max = max - min;
    return (Math.random() * max + min) * (Math.random() > 0.5 ? -1 : 1);
}
