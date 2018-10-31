window.pageNum = 7;

let canvasShown = true;
let buttonCanvas = $('#button_canvas'); // Кнопка переключения в режим линии
let buttonGraph = $('#button_graph'); // Кнопка переключения в режим окружности
let buttonClear = $('#button_clear'); // Кнопка очистки холста
let fileInput = $('#input_file');     // Кнопка загрузки файла
let fileInputLabel = $('#input_file_label span');
let canvas = $('#canvas'); // Холст для рисования
let analysis = $('.analysis'); // Таб с анализом изображения
let graph = $('#histogram'); // Гистограмма
let stats = $('#stats'); // Статистика

let color = [255, 255, 255, 255]; // Цвет чистого холста

// Интерфейс холста
let canvasInterface = new CanvasAnalysisInterface(canvas[0], canvas.width(), canvas.height(), color, graph[0], stats[0]);

// Очистка
buttonClear.click(() => {
    canvasInterface.clear();
    fileInput.val('');
    fileInputLabel.html('No file selected');
});

// Переключение между изображением и анализом
buttonCanvas.click(() => setCanvasShown(true));
buttonGraph.click(() => setCanvasShown(false));

// Вывод изображение при загрузке
fileInput.change(() => onFileChanged());

setCanvasShown(canvasShown);

canvasInterface.loadImage('./default_image.png');
fileInputLabel.html('default_image.png');

$(() => {
    let plotlyUrl = 'https://cdn.plot.ly/plotly-latest.min.js';
    $.getScript(plotlyUrl, (d) => {
        canvasInterface.drawHistogram();
    });
});

// Переключает между изображением и анализом
function setCanvasShown(enabled) {
    canvasShown = enabled;
    let [on, off] = canvasShown ? [buttonCanvas, buttonGraph] : [buttonGraph, buttonCanvas];
    let [shown, hidden] = canvasShown ? [canvas, analysis] : [analysis, canvas];
    on.addClass('active');
    off.removeClass('active');
    shown.show();
    hidden.hide();
}

// Выводит изображение и гистограмму
function onFileChanged() {
    let file = fileInput[0].files[0];
    fileInputLabel.html(file ? file.name : 'No file selected');
    canvasInterface.loadImageFromFile(file);
}
