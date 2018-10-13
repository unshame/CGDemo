/* exported FilterCanvasInterface */
class FilterCanvasInterface {

    /**
    * Холст для рисования линий и окружностей по алгоритму Брезенхема.
    * Конструктор создает рендерер для рисования пикселей на холсте и массив для хранения фигур для рисования.
    * @class
    * @param {HTMLCanvasElement} canvas  HTML-элемент холст
    * @param {number}            width   ширина холста
    * @param {number}            height  высота холста
    * @param {array}             clearColor   цвет рисования по холсту [r, g, b, a]
    */
    constructor(canvas, width, height, clearColor, kernel, shouldConvolute) {

        /**
        * Объект, рисующий пиксели на холсте.
        * @type {Renderer}
        */
        this.renderer = new Renderer(canvas, width, height, clearColor);

        this.kernel = kernel;

        this.shouldConvolute = false;

        this.renderer.clearCanvas();
    }

    /* Очищает холст и выводит все фигуры из массива. */
    update() {
        let convolutedCanvasData = this.shouldConvolute && this.renderer.convoluteCanvasData(this.renderer.canvasData, this.kernel);
        this.renderer.update(convolutedCanvasData);
    }

    /** Очищает массив и холст. */
    clear() {
        this.renderer.clearCanvas();
        this.renderer.update();
    }

    setConvolution(enabled) {
        this.shouldConvolute = enabled;
        this.update();
    }

    loadImageFromInput(input) {
        let file = input.files[0];

        if(!file) {
            this.clear();
            return;
        }

        let fileReader = new FileReader();
        fileReader.onload = () => this.loadImage(fileReader.result);
        fileReader.readAsDataURL(file);
    }

    loadImage(url) {
        let img = new Image();

        img.onload = () => {
            this.renderer.drawImage(img);
            this.update();
        };

        img.src = url;
        img.setAttribute('crossOrigin', '');
    }

    getImageDataURL() {
        return this.canvas.toDataURL('image/png');
    }
}