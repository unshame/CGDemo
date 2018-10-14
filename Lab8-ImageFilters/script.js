window.pageNum = 6;

let convolutionEnabled = false;
let buttonBlurOff = $('#button_blur_off'); // Кнопка переключения в режим линии
let buttonBlurOn = $('#button_blur_on'); // Кнопка переключения в режим окружности
let buttonClear = $('#button_clear'); // Кнопка очистки холста
let buttonSave = $('#button_save');
let fileInput = $('#input_file');
let fileInputLabel = $('#input_file_label span');
let canvas = $('#canvas'); // Холст для рисования

let color = [255, 255, 255, 255]; // Цвет кисти
let kernel = [
    0.1, 0.1, 0.1,
    0.1, 0.2, 0.1,
    0.1, 0.1, 0.1
];
let canvasInterface = new FilterCanvasInterface(canvas[0], canvas.width(), canvas.height(), color, kernel, convolutionEnabled, buttonSave[0]); // Рисующий объект

// Очистка по нажатию на крестик
buttonClear.click(() => {
    canvasInterface.clear();
    fileInput.val('');
    fileInputLabel.html('No file selected');
});

// Смена режима рисования по нажатию на кнопки внизу
buttonBlurOff.click(() => setConvolution(false));
buttonBlurOn.click(() => setConvolution(true));

fileInput.change(() => onFileChanged());

setConvolution(convolutionEnabled);

canvasInterface.loadImage('./default_image.png');
fileInputLabel.html('default_image.png');

function setConvolution(enabled) {
    convolutionEnabled = enabled;
    let [on, off] = !convolutionEnabled ? [buttonBlurOff, buttonBlurOn] : [buttonBlurOn, buttonBlurOff];
    on.addClass('active');
    off.removeClass('active');
    canvasInterface.setConvolution(enabled);
}

function onFileChanged() {
    let file = fileInput[0].files[0];
    fileInputLabel.html(file ? file.name : 'No file selected');
    canvasInterface.loadImageFromFile(file);
}
