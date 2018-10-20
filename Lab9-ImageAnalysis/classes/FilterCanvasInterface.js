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
    constructor(canvas, width, height, clearColor, grpahNode, statsNode) {

        /**
        * Объект, рисующий пиксели на холсте.
        * @type {Renderer}
        */
        this.renderer = new Renderer(canvas, width, height, clearColor);

        this.grpahNode = grpahNode;
        this.statsNode = statsNode;

        this.renderer.clearCanvas();
    }

    /* Очищает холст и выводит все фигуры из массива. */
    update() {
        this.renderer.update();
        this.drawHistogram();
    }

    /** Очищает массив и холст. */
    clear() {
        this.renderer.clearCanvas();
        this.renderer.update();
        this.drawHistogram();
    }

    setConvolution(enabled) {
        this.shouldConvolute = enabled;
        this.update();
    }

    loadImageFromFile(file) {

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

        img.setAttribute('crossOrigin', '');
        img.onload = () => {
            this.renderer.drawImage(img);
            this.update();
        };

        img.src = url;
    }

    drawHistogram() {

        let colors = ['red', 'green', 'blue'];

        let [ys, ms] = this.renderer.getHistogramData();
        var data = [];
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

        var layout = {
            barmode: 'overlay',
            bargap: 0,
            xaxis: {
                range: [0, 255]
            },
            yaxis: {
                showticklabels: false
            }
        };

        Plotly.newPlot(this.grpahNode, data, layout);
        this.statsNode.innerHTML = this._formatStats(ms, colors);
    }

    _formatStats(stats, colors) {
        let fmt = '';

        for(let i = 0; i < stats.length; i++) {
            let stat = stats[i];
            let color = colors[i];
            fmt += `<span style="color: ${color}"><b>m<sub>2${i + 1};</sub></b> = ${stat.toFixed(2)}</span>; `;
        }

        return fmt;
    }

}