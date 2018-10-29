window.pageNum = 6;

let canvas = $('#canvas'); // Холст для рисования
let buttonBlurOff = $('#button_blur_off');        // Кнопка выключения конволюции
let buttonBlurOn = $('#button_blur_on');          // Кнопка включения конволюции
let buttonClear = $('#button_clear');             // Кнопка очистки холста
let buttonSave = $('#button_save');               // Кнопка сохранения изображения
let fileInput = $('#input_file');                 // Кнопка загрузки изображения
let fileInputLabel = $('#input_file_label span'); // Лейбл кнопки загрузки изображения

let convolutionEnabled = false; // Включена ли конволюция
let color = [255, 255, 255, 255]; // Цвет чистого холста

// Матрица конволюции
let kernel = [
    0.1, 0.1, 0.1,
    0.1, 0.2, 0.1,
    0.1, 0.1, 0.1
];

// Интерфейс холста
let canvasInterface = new FilterCanvasInterface(canvas[0], canvas.width(), canvas.height(), color, kernel, convolutionEnabled, buttonSave[0]);

// Очистка по нажатию на крестик
buttonClear.click(() => {
    canvasInterface.clear();
    fileInput.val('');
    fileInputLabel.html('No file selected');
});

// Смена режима рисования по нажатию на кнопки внизу
buttonBlurOff.click(() => setConvolution(false));
buttonBlurOn.click(() => setConvolution(true));

// Событие по загрузке нового файла
fileInput.change(() => onFileChanged());

setConvolution(convolutionEnabled);

canvasInterface.loadImage('./default_image.png');
fileInputLabel.html('default_image.png');

// Устанавливает режим конволюции
function setConvolution(enabled) {
    convolutionEnabled = enabled;
    let [on, off] = !convolutionEnabled ? [buttonBlurOff, buttonBlurOn] : [buttonBlurOn, buttonBlurOff];
    on.addClass('active');
    off.removeClass('active');
    canvasInterface.setConvolution(enabled);
}

// Выполняется при смене файла
function onFileChanged() {
    let file = fileInput[0].files[0];
    fileInputLabel.html(file ? file.name : 'No file selected');
    canvasInterface.loadImageFromFile(file);
}
