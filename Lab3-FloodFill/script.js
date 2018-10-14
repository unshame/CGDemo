window.pageNum = 3;

let gradual = true; // Включена ли постепенная заливка

// Кнопки
let buttonGradual = $('#button_gradual');
let buttonInstant = $('#button_instant');
let buttonClear = $('#button_clear');

// Холсты
let canvasSlow = $('#canvas_slow');
let canvasFast = $('#canvas_fast');

// Цвета
let color = [33, 150, 243, 255];
let fillColor = [13, 71, 161, 255];

let fillFunc; // Функция заливки

let scale = 8;
let w = Math.round(canvasSlow.width() / scale);
let h = Math.round(canvasSlow.height() / scale);
let numRects = 100;
let maxRectWidth = Math.round(150 / scale);

// Создаем интерфейсы для холста
let canvasInterfaceSlow = new SlowFloodFillCanvas(canvasSlow[0], w, h, color, fillColor, numRects, maxRectWidth);
let canvasInterfaceFast = new FastFloodFillCanvas(canvasFast[0], w, h, color, fillColor, numRects, maxRectWidth);

// Интерфейс для работы с несколькими интерфейсами
let multiCanvasInterface = new MultiCanvasInterface(canvasInterfaceSlow, canvasInterfaceFast);

// СОбытие нажатия на кнопку очистки
buttonClear.click(() => multiCanvasInterface.reset());

// События нажатия на холсты
canvasSlow.click((event) => canvasClick(event));
canvasFast.click((event) => canvasClick(event));

// События нажатия на кнопки режима заливки
buttonGradual.click(() => setGradual(true));
buttonInstant.click(() => setGradual(false));

// Устанавливаем постепенную заливку
setGradual(true);

// Инициализируем холсты
multiCanvasInterface.reset();

// Устанавливает постепенную заливку
function setGradual(_gradual) {
    gradual = _gradual;
    let [on, off] = gradual ? [buttonGradual, buttonInstant] : [buttonInstant, buttonGradual];
    on.addClass('active');
    off.removeClass('active');
    fillFunc = gradual ? multiCanvasInterface.fillStep.bind(multiCanvasInterface) : multiCanvasInterface.fill.bind(multiCanvasInterface);
}

// Вызывается при клике на холст
function canvasClick(event) {
    fillFunc({
        x: Math.round((event.offsetX - 1) / scale),
        y: Math.round((event.offsetY - 1) / scale)
    }, 10);
}
