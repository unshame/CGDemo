window.pageNum = 7;

let canvasShown = true;
let buttonCanvas = $('#button_canvas'); // Кнопка переключения в режим линии
let buttonGraph = $('#button_graph'); // Кнопка переключения в режим окружности
let buttonClear = $('#button_clear'); // Кнопка очистки холста
let fileInput = $('#input_file');     // Кнопка загрузки файла
let fileInputLabel = $('#input_file_label span');
let canvas = $('#canvas'); // Холст для рисования
let analysis = $('.analysis'); // Таб с анализом изображения
let stats = $('#stats'); // Статистика

let color = [255, 255, 255, 255]; // Цвет чистого холста

// Интерфейс холста
let plotter = new OptimizationMethodPlotter('graph');

$(() => {
    let plotlyUrl = '../shared/lib/plotly-latest.js';
    $.getScript(plotlyUrl, (d) => {
        plotter.plotGraph(
            x => 2 * x * x - 12 * x,
            OptimizationMethods.fibonacci,
            1000,
            {
                a: 0,
                b: 10,
                l: 0.1,
                ep: 0.01,
                sign: -1
            }
        );
    });
});
