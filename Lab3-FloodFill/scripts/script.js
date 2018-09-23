let mode = 'line'; // Режим рисования (line или rectangle)
let clip = true;   // Включено ли отсечение
let buttonLine = $('#button_line'); // Кнопка переключения в режим линии
let buttonRectangle = $('#button_rectangle'); // Кнопка переключения в режим окружности
let buttonClear = $('#button_clear'); // Кнопка очистки холста
let canvas = $('#canvas'); // Холст для рисования

let color = [33, 150, 243, 255]; // Цвет кисти
//let canvasInterface = new CohenSutherlandCanvas(canvas[0], canvas.width(), canvas.height(), color, true); // Интерфейс для холста
//let brush = new Brush(canvasInterface, mode); // Кисть
