/* exported Renderer */
class Renderer {

    /**
    * Рисует пиксели на холсте.
    * @class
    * @param {HTMLCanvasElement} canvas     элемент холст
    * @param {number}            width      ширина холста
    * @param {number}            height     высота холста
    * @param {array}             clearColor цвет чистого холста
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
        * @type {ImageData}
        */
        this.canvasData = this.ctx.getImageData(0, 0, width, height);

        /**
        * Цвет чистого холста.
        * @type {array}
        */
        this.clearColor = clearColor;
    }

    /** Ширина холста.
    * @type {number}
    */
    get width() {
        return this.canvas.width;
    }

    set width(width) {
        this.canvas.width = width;
    }

    /** Высота холста.
    * @type {number}
    */
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

    /** Восстанавливает значение массива пикселей в соответствии с текущим отображаемым изображением. */
    restore() {
        this.canvasData = this.ctx.getImageData(0, 0, this.width, this.height);
    }

    /** Очищает холст. */
    clearCanvas() {

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                let index = (x + y * this.width) * 4;
                let canvasData = this.canvasData;

                canvasData.data[index + 0] = this.clearColor[0];
                canvasData.data[index + 1] = this.clearColor[1];
                canvasData.data[index + 2] = this.clearColor[2];
                canvasData.data[index + 3] = this.clearColor[3];
            }
        }
    }

    /**
    * Выводит изображение на холст.
    * @param  {Image} image объект изображения
    */
    drawImage(image) {
        this.width = image.width;
        this.height = image.height;
        this.ctx.drawImage(image, 0, 0);
        this.restore();
    }

    /**
    * Собирает и возвращает значения для гистограммы и статистику по каждому цвету.
    * @return {array} [гистограммы, статистика]
    */
    getHistogramData() {
        let w = this.canvasData.width;
        let h = this.canvasData.height;
        let rgb = [[], [], []];
        let ms = [0, 0, 0];
        let len = w * h;
        let max = 255;

        for (let i = 0; i < rgb.length; i++) {
            rgb[i].length = max + 1;
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