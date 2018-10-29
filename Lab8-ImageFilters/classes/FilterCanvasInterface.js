/* exported FilterCanvasInterface */
class FilterCanvasInterface {

    /**
    * Холст для применения матрицы конволюции к изображению.
    * Конструктор создает рендерер для отображения изображения на холсте.
    * @class
    * @param {HTMLCanvasElement}  canvas          элемент холст
    * @param {number}             width           ширина холста
    * @param {number}             height          высота холста
    * @param {array}              clearColor      цвет чистого холста
    * @param {array}              kernel          матрица конволюции
    * @param {boolean}            shouldConvolute нужно ли применять матрицу конволюции по умолчанию
    * @param {HTMLAnchorEelement} saveAnchor      элемент ссылки для сохранения изображения
    */
    constructor(canvas, width, height, clearColor, kernel, shouldConvolute, saveAnchor) {

        /**
        * Объект, отображающий изображение на холсте.
        * @type {Renderer}
        */
        this.renderer = new Renderer(canvas, width, height, clearColor);

        /**
        * Матрица конволюции.
        * @type {array}
        */
        this.kernel = kernel;

        /**
        * Нужно ли применять матрицу конволюции при апдейте.
        * @type {boolean}
        */
        this.shouldConvolute = shouldConvolute;

        /**
        * элемент ссылки для сохранения изображения
        * @type {HTMLAnchorEelement}
        */
        this.saveAnchor = saveAnchor;

        this.renderer.clearCanvas();
    }

    /* Выводит изображение на холст с или без применения матрицы конволюции. */
    update() {
        let convolutedCanvasData = this.shouldConvolute && this.renderer.convoluteCanvasData(this.renderer.canvasData, this.kernel);
        this.renderer.update(convolutedCanvasData);
        this.updateSaveAnchor();
    }

    /** Очищает холст. */
    clear() {
        this.renderer.clearCanvas();
        this.renderer.update();
        this.updateSaveAnchor();
    }

    /**
    * Устанавливает режим конволюции (вкл/выкл) и обновляет холст.
    * @param {boolean} enabled включен ли режим конволюции
    */
    setConvolution(enabled) {
        this.shouldConvolute = enabled;
        this.update();
    }

    /**
    * Загружает и выводит изображение из файла.
    * @param  {File} file объект файла
    */
    loadImageFromFile(file) {

        if(!file) {
            this.clear();
            return;
        }

        let fileReader = new FileReader();
        fileReader.onload = () => this.loadImage(fileReader.result);
        fileReader.readAsDataURL(file);
    }

    /**
    * Загружает изображение по адресу.
    * @param  {string} url адрес изображения
    */
    loadImage(url) {
        let img = new Image();

        img.onload = () => {
            this.renderer.drawImage(img);
            this.update();
        };

        img.src = url;
        img.setAttribute('crossOrigin', '');
    }

    /** Обновляет ссылку для сохранения изображения. */
    updateSaveAnchor() {
        this.renderer.canvas.toBlob((blob) => {
            console.log('Generated image blob');
            this.saveAnchor.setAttribute('href', window.URL.createObjectURL(blob));
        });
    }
}