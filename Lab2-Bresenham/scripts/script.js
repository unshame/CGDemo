let mode = 'line';
let $ = window.$;
let buttonLine = $('#button_line');
let buttonCircle = $('#button_circle');

buttonLine.click(() => setMode('line'));
buttonCircle.click(() => setMode('circle'));

let canvas = $('#canvas');
let bresCanvas = new BresenhamsCanvas(canvas[0], canvas.width(), canvas.height(), [33, 150, 243, 255]);
let brush = new Brush(bresCanvas, mode);

setMode('line');

canvas.mousedown((event) => brush.start(event));

canvas.mousemove((event) => brush.update(event));

canvas.mouseup((event) => brush.end(event));

canvas.mouseout((event) => brush.end(event))


$('#button_clear').click(() => {
    bresCanvas.clear();
});


function setMode(_mode) {
    mode = _mode;
    let [on, off] = mode == 'line' ? [buttonLine, buttonCircle] : [buttonCircle, buttonLine];
    on.addClass('active');
    off.removeClass('active');
    brush.setType(mode);
}
