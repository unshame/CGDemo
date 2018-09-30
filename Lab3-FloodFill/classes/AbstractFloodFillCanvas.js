/* exported AbstractFloodFillCanvas */
class AbstractFloodFillCanvas {

    /**
    * Абстрактный класс интерфейса для заливания холста по четырем ближайшим пикселям.
    * Создает Renderer для рисования пикселей на холсте.
    * @class
    * @abstract
    * @param {HTMLCanvasElement} canvas       элемент холст
    * @param {number}            width        ширина холста
    * @param {number}            height       высота холста
    * @param {number[]}          color        цвет рисования по холсту [r, g, b, a]
    * @param {number[]}          fillColor    цвет заливки
    * @param {number}            numRects     количество генерируемых четырехугольников
    * @param {number}            maxRectWidth максимальная длина стороны генерируемых четырехугольников
    */
    constructor(canvas, width, height, color, fillColor, numRects, maxRectWidth) {

        /**
        * Направления заливки (право, лево, низ, верх)
        * @type {Array}
        */
        this.dirs = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];

        /**
        * Цвет заливки.
        * @type {number[]}
        */
        this.fillColor = fillColor;

        /**
        * Количество генерируемых четырехугольников.
        * @type {number}
        */
        this.numRects = numRects;

        /**
        * Максимальная длина стороны генерируемых четырехугольников.
        * @type {number}
        */
        this.maxRectWidth = maxRectWidth;

        /**
        * ID интервалов запущенных инстанций пошаговой заливки.
        * @type {Array}
        */
        this.intervals = [];

        /**
        * Объект, рисующий пиксели на холсте.
        * @type {Renderer}
        */
        this.renderer = new Renderer(canvas, width, height, color);
        this.renderer.ctx.globalAlpha = 1;
    }

    /** Останавливает пошаговую заливку, очищает холст и заливает его новыми случайным четырехугольниками. */
    reset() {
        this.clearIntervals();
        this.renderer.clearCanvas();
        this.renderer.update();
        this.randomlyFillCanvas();
    }

    /** Останавливает все запущенные пошаговые заливки. */
    clearIntervals() {
        for (let int of this.intervals) {
            clearInterval(int);
        }
        this.intervals.length = 0;
    }

    /** Заполняет холст случайныи многоугольниками. */
    randomlyFillCanvas() {

        let numRects = this.numRects;
        let w = this.renderer.width;
        let h = this.renderer.height;
        let maxRectWidth = this.maxRectWidth;
        let numVerts = 4;
        let ctx = this.renderer.ctx;

        ctx.beginPath();
        for (let i = 0; i < numRects; i++) {

            let x = Math.floor(Math.random() * w);
            let y = Math.floor(Math.random() * h);

            ctx.moveTo(x, y);

            for (let k = 1; k < numVerts; k++) {

                let dx = Math.floor(Math.random() * maxRectWidth) - maxRectWidth / 2;
                let dy = Math.floor(Math.random() * maxRectWidth) - maxRectWidth / 2;

                x += dx;
                y += dy;

                ctx.lineTo(x, y);
            }
            ctx.closePath();
        }
        ctx.fill();

        this.renderer.restore();
        this.renderer.removeAntiAliasing();
        this.renderer.update();
    }

    /**
    * Заливает холст, начиная с переданной точки.
    * @param  {point} p точка начала заливки
    */
    fill(p) {
        let filler = this.fillGenerator(p);
        while (!filler.next().done){};
    }

    /**
    * Пошагово заливает холст, начиная с переданной точки.
    * @param {point}  p        точка начала заливки
    * @param {number} interval интервал шага
    */
    fillStep(p, interval = 0) {
        let filler = this.fillGenerator(p);
        let int = setInterval(() => {

            if (filler.next().done) {
                clearInterval(int);
                this.intervals.splice(this.intervals.indexOf(int), 1);
            }

            this.renderer.update();
        }, interval);

        this.intervals.push(int);
    }

    /** Абстрактный метод заливки холста. */
    *fillGenerator() {
        throw Error('Not implemented');
    }
}