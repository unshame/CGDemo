/* exported Renderer */
class Renderer {

    /**
    * Выводит изображение на холст.
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
        * Объект, содержащий массив, представляющий пиксели холста.
        * @type {ImageData}
        */
        this.canvasData = this.ctx.getImageData(0, 0, width, height);

        /**
        * Цвет очистки холста.
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

    /** 
    * Обновляет изображение на холсте.
    * @param  {ImageData} canvasData новое изображение
    */
    update(canvasData) {
        this.ctx.putImageData(canvasData || this.canvasData, 0, 0);
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
    * Применяет матрицу конволюции к переданному массиву пикселей.
    * @param {ImageData} canvasData объект, содержащий массив пикселей.
    * @param {array}     kernel     матрица конволюции
    *
    * @return {ImageData} объект, содержащий массив пикселей с примененной матрицой конволюции
    */
    convoluteCanvasData(canvasData, kernel) {

        let side = Math.round(Math.sqrt(kernel.length));
        let kernelOffset = Math.floor(side / 2);

        let w = canvasData.width;
        let h = canvasData.height;

        // Исходное изображение
        let src = this.canvasData.data;

        // Полученное изображение
        let output = this.ctx.createImageData(w, h);
        let dst = output.data;

        // Проходим по всему изображению
        for (let y = 0; y < h; y++) {

            for (let x = 0; x < w; x++) {

                let dstOffset = (y * w + x) * 4; // dst[x][y][0]

                let r = 0, g = 0, b = 0;

                // Складываем умноженное на значения матрицы свертки значение текущего пикселя и всех пикселей в округе
                kernel_loop:
                for (let cy = 0; cy < side; cy++) {

                    for (let cx = 0; cx < side; cx++) {

                        let scy = y + cy - kernelOffset;
                        let scx = x + cx - kernelOffset;

                        // Не трогаем пиксели по краям
                        if(scx < 0 || scx >= w || scy < 0 || scy >= h) {
                            r = src[dstOffset + 0];
                            g = src[dstOffset + 1];
                            b = src[dstOffset + 2];
                            break kernel_loop;
                        }

                        let srcOffset = (scy * w + scx) * 4; // src[scx][scy][0]
                        let wt = kernel[cy * side + cx];     // kernel[cx][cy]

                        // Добавляем значение каждого канала цвета, умноженное на вес
                        r += src[srcOffset + 0] * wt;
                        g += src[srcOffset + 1] * wt;
                        b += src[srcOffset + 2] * wt;
                    }
                }

                // Ставим полученный цвет в выходной массив
                dst[dstOffset + 0] = r;
                dst[dstOffset + 1] = g;
                dst[dstOffset + 2] = b;

                // Убираем прозрачность
                dst[dstOffset + 3] = 255;
            }
        }

        return output;
    }
}