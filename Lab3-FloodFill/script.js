window.pageNum = 3;

let gradual = true;
let buttonGradual = $('#button_gradual'); 
let buttonInstant = $('#button_instant');
let buttonClear = $('#button_clear');
let canvasSlow = $('#canvas_slow');
let canvasFast = $('#canvas_fast');

let color = [33, 150, 243, 255]; // Цвет кисти
let fillColor = [13, 71, 161, 255];
let fillFunc;

let scale = 8;
let w = Math.round(canvasSlow.width() / scale);
let h = Math.round(canvasSlow.height() / scale);
let numRects = 100;
let maxRectWidth = Math.round(150 / scale);

let canvasInterfaceSlow = new SlowFloodFillCanvas(canvasSlow[0], w, h, color, fillColor, numRects, maxRectWidth);
let canvasInterfaceFast = new FastFloodFillCanvas(canvasFast[0], w, h, color, fillColor, numRects, maxRectWidth);

let multiCanvasInterface = new MultiCanvasInterface(canvasInterfaceSlow, canvasInterfaceFast);

buttonClear.click(() => multiCanvasInterface.reset());


canvasSlow.click((event) => canvasClick(event));
canvasFast.click((event) => canvasClick(event));

buttonGradual.click(() => setGradual(true));
buttonInstant.click(() => setGradual(false));

setGradual(true);
multiCanvasInterface.reset();

function setGradual(_gradual) {
    gradual = _gradual;
    let [on, off] = gradual ? [buttonGradual, buttonInstant] : [buttonInstant, buttonGradual];
    on.addClass('active');
    off.removeClass('active');
    fillFunc = gradual ? multiCanvasInterface.fillStep.bind(multiCanvasInterface) : multiCanvasInterface.fill.bind(multiCanvasInterface);
}

function canvasClick(event) {
    fillFunc({
        x: Math.round((event.offsetX - 1) / scale),
        y: Math.round((event.offsetY - 1) / scale)
    }, 10);
}
