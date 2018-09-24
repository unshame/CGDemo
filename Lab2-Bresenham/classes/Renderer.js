/* exported Renderer */
class Renderer {

    /**
    * Рисует пиксели на холсте.
    * @class
    * @param {HTMLCanvasElement} canvas  HTML-элемент холст
    * @param {number}            width   ширина холста
    * @param {number}            height  высота холста
    * @param {array}             color   цвет рисования по холсту [r, g, b, a]
    */
    constructor(canvas, width, height, color) {

        /**
        * Холст.
        * @type {HTMLCanvasElement}
        */
        this.canvas = canvas;

        /**
        * Контекст для рисования на холсте.
        * @type {CanvasRenderingContext2D}
        */
        this.ctx = canvas.getContext('2d');

        this.width = width;
        this.height = height;

        /**
        * Массив, представляющий пиксели холста.
        * @type {array}
        */
        this.canvasData = this.ctx.getImageData(0, 0, width, height);

        /**
        * Установленный цвет рисования на холсте.
        * @type {array}
        */
        this.color = color;
    }

    /** Ширина холста. */
    get width() {
        return this.canvas.width;
    }

    set width(width) {
        this.canvas.width = width;
    }

    /** Высота холста. */
    get height() {
        return this.canvas.height;
    }

    set height(height) {
        this.canvas.height = height;
    }

    /** Обновляет изображение на холсте. */
    update() {
        this.ctx.putImageData(this.canvasData, 0, 0);
    }

    /**
    * Рисует пиксель на холсте.
    * @param  {point} p      координаты пикселя
    * @param  {array} color  цвет пикселя
    */
    drawPixel(p, color) {

        if (!this.pixelIsInside(p)) {
            return;
        }

        let index = (p.x + p.y * this.width) * 4;
        let canvasData = this.canvasData;

        canvasData.data[index] = color[0];
        canvasData.data[index + 1] = color[1];
        canvasData.data[index + 2] = color[2];
        canvasData.data[index + 3] = color[3];
    }

    /**
    * Рисует пиксель установленного цвета на холсте.
    * @param  {point} p      координаты пикселя
    */
    drawColoredPixel(p) {
        this.drawPixel(p, this.color);
    }

    /**
    * Рисует прозрачный пиксель на холсте.
    * @param  {point} p      координаты пикселя
    */
    drawClearPixel(p) {
        this.drawPixel(p, [255, 255, 255, 0]);
    }

    /** Очищает холст. */
    clearCanvas() {
        let canvasData = this.canvasData;

        for (let i = 3; i < canvasData.data.length; i += 4) {
            canvasData.data[i] = 0;
        }
    }

    /**
    * Проверяет, находится ли пиксель внутри холста.
    * @param  {point} p      координаты пикселя
    *
    * @return {bool}
    */
    pixelIsInside(p) {
        return p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height;
    }

}