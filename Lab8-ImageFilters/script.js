window.pageNum = 6;

let convolutionEnabled = false;
let buttonBlurOff = $('#button_blur_off'); // Кнопка переключения в режим линии
let buttonBlurOn = $('#button_blur_on'); // Кнопка переключения в режим окружности
let buttonClear = $('#button_clear'); // Кнопка очистки холста
let fileInput = $('#input_file');
let canvas = $('#canvas'); // Холст для рисования

let color = [255, 255, 255, 255]; // Цвет кисти
let kernel = [
    0.1, 0.1, 0.1,
    0.1, 0.2, 0.1,
    0.1, 0.1, 0.1
];
let canvasInterface = new FilterCanvasInterface(canvas[0], canvas.width(), canvas.height(), color, kernel, convolutionEnabled); // Рисующий объект

// Очистка по нажатию на крестик
buttonClear.click(() => {
    canvasInterface.clear();
    fileInput.val('');
});

// Смена режима рисования по нажатию на кнопки внизу
buttonBlurOff.click(() => setConvolution(false));
buttonBlurOn.click(() => setConvolution(true));

fileInput.change(() => canvasInterface.loadImageFromInput(fileInput[0]));

setConvolution(convolutionEnabled);

addSaveButton();

canvasInterface.loadImage('./default_image.png');

function setConvolution(enabled) {
    convolutionEnabled = enabled;
    let [on, off] = !convolutionEnabled ? [buttonBlurOff, buttonBlurOn] : [buttonBlurOn, buttonBlurOff];
    on.addClass('active');
    off.removeClass('active');
    canvasInterface.setConvolution(enabled);
}
