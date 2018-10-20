/* exported Renderer */
class Renderer {

    /**
    * Рисует пиксели на холсте.
    * @class
    * @param {HTMLCanvasElement} canvas  HTML-элемент холст
    * @param {number}            width   ширина холста
    * @param {number}            height  высота холста
    * @param {array}             clearColor   цвет рисования по холсту [r, g, b, a]
    */
    constructor(canvas, width, height, clearColor) {

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
        this.clearColor = clearColor;
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
    update(canvasData) {
        this.ctx.putImageData(canvasData || this.canvasData, 0, 0);
    }

    restore() {
        this.canvasData = this.ctx.getImageData(0, 0, this.width, this.height);
    }

    /** Очищает холст. */
    clearCanvas() {

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                let index = (x + y * this.width) * 4;
                let canvasData = this.canvasData;

                canvasData.data[index] = this.clearColor[0];
                canvasData.data[index + 1] = this.clearColor[1];
                canvasData.data[index + 2] = this.clearColor[2];
                canvasData.data[index + 3] = this.clearColor[3];
            }
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

    drawImage(image) {
        this.width = image.width;
        this.height = image.height;
        this.ctx.drawImage(image, 0, 0);
        this.restore();
    }

    getHistogramData() {
        let w = this.canvasData.width;
        let h = this.canvasData.height;
        let rgb = [[], [], []];
        let ms = [0, 0, 0];
        let len = w * h;
        let max = 255;

        for (let i = 0; i < rgb.length; i++) {
            rgb[i].length = max;
            rgb[i].fill(0);
        }

        for (let y = 0; y < h; y++) {

            for (let x = 0; x < w; x++) {

                let offset = (y * w + x) * 4;

                for(let i = 0; i < rgb.length; i++) {
                    let val = this.canvasData.data[offset  + i];
                    rgb[i][val]++;
                    ms[i] += val * val;
                }
            }
        }

        for (let i = 0; i < ms.length; i++) {
            ms[i] = ms[i] / len;
        }

        return [rgb, ms];
    }
}