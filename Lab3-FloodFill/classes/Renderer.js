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
        this.canvasData = null;

        /**
        * Установленный цвет рисования на холсте.
        * @type {array}
        */
        this.color = color;

        this.clearColor = [0, 0, 0, 0];

        this.restore();
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

    get color() {
        return this._color;
    }

    set color(color) {
        this._color = color.slice();
        this.ctx.strokeStyle = `rgba(${color.join(',')})`;
        this.ctx.fillStyle = `rgba(${color.join(',')})`;
    }

    restore() {
        this.canvasData = this.ctx.getImageData(0, 0, this.width, this.height);
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
        this.drawPixel(p, this.clearColor);
    }

    /** Очищает холст. */
    clearCanvas() {
        let canvasData = this.canvasData;

        for (let i = 0; i < canvasData.data.length; i ++) {
            canvasData.data[i] = 0;
        }
    }

    removeAntiAliasing() {
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                let p = {x, y};
                if(!this.pixelHasColor(p, this.color) && !this.pixelHasColor(p, this.clearColor)) {
                    this.drawClearPixel(p);
                }
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

    getPixelColor(p) {
        let index = (p.x + p.y * this.width) * 4;
        let canvasData = this.canvasData;

        let color = [];
        for (let i = 0; i < 4; i++) {
            color.push(canvasData.data[index + i]);
        }

        return color;
    }


    pixelHasColor(p, color) {
        let index = (p.x + p.y * this.width) * 4;
        let canvasData = this.canvasData;

        for(let i = 0; i < 4; i++){
            if(canvasData.data[index + i] !== color[i]) {
                return false;
            }
        }

        return true;
    }

}