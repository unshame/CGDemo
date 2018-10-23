window.pageNum = 7;

let canvasShown = true;
let buttonCanvas = $('#button_canvas'); // Кнопка переключения в режим линии
let buttonGraph = $('#button_graph'); // Кнопка переключения в режим окружности
let buttonClear = $('#button_clear'); // Кнопка очистки холста
let fileInput = $('#input_file');
let fileInputLabel = $('#input_file_label span');
let canvas = $('#canvas'); // Холст для рисования
let analysis = $('.analysis');
let graph = $('#histogram');
let stats = $('#stats');

let color = [255, 255, 255, 255];
let canvasInterface = new CanvasAnalysisInterface(canvas[0], canvas.width(), canvas.height(), color, graph[0], stats[0]); // Рисующий объект

// Очистка по нажатию на крестик
buttonClear.click(() => {
    canvasInterface.clear();
    fileInput.val('');
    fileInputLabel.html('No file selected');
});

// Смена режима рисования по нажатию на кнопки внизу
buttonCanvas.click(() => setCanvasShown(true));
buttonGraph.click(() => setCanvasShown(false));

fileInput.change(() => onFileChanged());

setCanvasShown(canvasShown);

canvasInterface.loadImage('../default_image.png');
fileInputLabel.html('default_image.png');

$(() => {
    let plotlyUrl = 'https://cdn.plot.ly/plotly-latest.min.js';
    $.getScript(plotlyUrl, (d) => {
        canvasInterface.drawHistogram();
    });
});

function setCanvasShown(enabled) {
    canvasShown = enabled;
    let [on, off] = canvasShown ? [buttonCanvas, buttonGraph] : [buttonGraph, buttonCanvas];
    let [shown, hidden] = canvasShown ? [canvas, analysis] : [analysis, canvas];
    on.addClass('active');
    off.removeClass('active');
    shown.show();
    hidden.hide();
}

function onFileChanged() {
    let file = fileInput[0].files[0];
    fileInputLabel.html(file ? file.name : 'No file selected');
    canvasInterface.loadImageFromFile(file);
}
