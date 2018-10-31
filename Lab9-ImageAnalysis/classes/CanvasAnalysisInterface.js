/* exported CanvasAnalysisInterface */
class CanvasAnalysisInterface {

    /**
    * Холст для анализа изображений.
    * Конструктор создает рендерер для отображения изображения.
    * @param {HTMLCanvasElement} canvas     элемент холст
    * @param {number}            width      ширина холста
    * @param {number}            height     высота холста
    * @param {array}             clearColor цвет чистого холста
    * @param {HTMLElement}       graphNode  элемент для отображения гистограмы
    * @param {HTMLElement}       statsNode  элемент для отображения статистики
    */
    constructor(canvas, width, height, clearColor, graphNode, statsNode) {

        /**
        * Объект, рисующий пиксели на холсте.
        * @type {Renderer}
        */
        this.renderer = new Renderer(canvas, width, height, clearColor);

        /**
        * Элемент страницы для отображения гистограммы.
        * @type {HTMLElement}
        */
        this.graphNode = graphNode;

        /**
        * Элемент для отображения статистики.
        * @type {HTMLElement}
        */
        this.statsNode = statsNode;

        this.renderer.clearCanvas();
    }

    /* Очищает холст и гистограмму. */
    update() {
        this.renderer.update();
        this.drawHistogram();
    }

    /** Обновляет изображение на холсте и гистограмму. */
    clear() {
        this.renderer.clearCanvas();
        this.renderer.update();
        this.drawHistogram();
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

        img.setAttribute('crossOrigin', '');
        img.onload = () => {
            this.renderer.drawImage(img);
            this.update();
        };

        img.src = url;
    }

    /** Выводит гистограмму и статистику изображения. */
    drawHistogram() {

        if (!window.Plotly) {
            return;
        }

        let colors = ['red', 'green', 'blue'];

        let [ys, ms] = this.renderer.getHistogramData();
        let data = [];
        for(let i = 0; i < colors.length; i++) {
            data[i] = {
                name: colors[i][0].toLocaleUpperCase() + colors[i].substr(1),
                y: ys[i],
                type: 'bar',
                opacity: 0.5,
                marker: {
                    color: colors[i],
                }
            };
        }

        let layout = {
            barmode: 'overlay',
            bargap: 0,
            xaxis: {
                range: [0, 255]
            },
            yaxis: {
                showticklabels: false
            }
        };

        Plotly.newPlot(this.graphNode, data, layout);
        this.statsNode.innerHTML = this._formatStats(ms, colors);
    }

    /**
    * Форматирует статистику.
    * @param {array} stats  статистика
    * @param {array} colors цвета статистики
    *
    * @return {string} форматированная статистика
    */
    _formatStats(stats, colors) {
        let fmt = '';

        for(let i = 0; i < stats.length; i++) {
            let stat = stats[i];
            let color = colors[i];
            fmt += `<span style="color: ${color}"><b>m<sub>2${color[0].toLowerCase()};</sub></b> = ${stat.toFixed(2)}</span>; `;
        }

        return fmt;
    }

}