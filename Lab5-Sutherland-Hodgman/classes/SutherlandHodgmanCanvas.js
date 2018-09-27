/* exported SutherlandHodgmanCanvas */
class SutherlandHodgmanCanvas {

    /**
    * Холст для рисования линий и их отсекания по алгоритму Коэна-Сазерленда.
    * Конструктор создает массив для хранения фигур для рисования.
    * @class
    * @param {HTMLCanvasElement} canvas  HTML-элемент холст
    * @param {number}            width   ширина холста
    * @param {number}            height  высота холста
    * @param {array}             color   цвет рисования по холсту [r, g, b, a]
    * @param {bool}              enabled включен ли режим отсечения по умолчанию
    */
    constructor(canvas, width, height, subjectColor, clippingColor, clippedColor, subjectPolygon, clippingEnabled, interval) {

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

        this.subjectPolygon = subjectPolygon.slice();
        this.clippingPolygon = [];
        this.clippingEnabled = clippingEnabled;

        this.clippingColor = clippingColor;
        this.subjectColor = subjectColor;
        this.clippedColor = clippedColor;

        this.interval = interval;
        this.int = null;

        this.resetClippingPolygon();
        this.update();
    }

    /**
    * Ширина холста.
    * @type {number}
    */
    get width() {
        return this.canvas.width;
    }

    set width(width) {
        this.canvas.width = width;
    }

    /**
    * Высота холста.
    * @type {number}
    */
    get height() {
        return this.canvas.height;
    }

    set height(height) {
        this.canvas.height = height;
    }

    resetClippingPolygon() {
        let w = this.width - 500;
        let h = this.height - 400;
        this.updateClippingPolygon(
            { x: this.width / 2 - w / 2, y: this.height / 2 - h / 2},
            { x: this.width / 2 + w / 2, y: this.height / 2 + h / 2}
        );
    }

    updateClippingPolygon(p1, p2) {
        this.clippingPolygon.length = 0;
        this.clippingPolygon.push({x: p1.x, y: p1.y});
        this.clippingPolygon.push({x: p1.x, y: p2.y});
        this.clippingPolygon.push({x: p2.x, y: p2.y});
        this.clippingPolygon.push({x: p2.x, y: p1.y});
    }

    update() {
        clearInterval(this.int);
        this.ctx.clearRect(0, 0, this.width, this.height);
        let clipper = this.clipPolygon(this.subjectPolygon, this.clippingPolygon);
        let result = clipper.next();

        while(!result.done) {
            result = clipper.next();
        }

        let clippedPolygon = result.value;
        this.drawPolygons(clippedPolygon);
    }

    updateStep(interval) {
        clearInterval(this.int);
        let clipper = this.clipPolygon(this.subjectPolygon, this.clippingPolygon);

        this.int = setInterval(() => {
            this.ctx.clearRect(0, 0, this.width, this.height);
            let result = clipper.next();

            if (result.done) {
                clearInterval(this.int);
            }

            let clippedPolygon = result.value;
            this.drawPolygons(clippedPolygon);
        }, this.interval);
    }

    drawPolygons(clippedPolygon) {
        this.drawPolygon(this.clippingPolygon, this.clippingColor);

        if (!this.clippingEnabled) {
            this.drawPolygon(this.subjectPolygon, this.subjectColor);
        }

        this.drawPolygon(clippedPolygon, this.clippedColor);
    }

    /** Очищает массив и холст. */
    clear() {
        this.resetClippingPolygon();
        this.update();
    }

    *clipPolygon(subjectPolygon, clippingPolygon) {

        let cp1, e;
        let outputList = subjectPolygon;
        yield outputList;
        cp1 = clippingPolygon[clippingPolygon.length - 1];
        let isClockwise = this.polygonIsClockwise(clippingPolygon);

        for (let j in clippingPolygon) {
            let cp2 = clippingPolygon[j];
            let inputList = outputList;
            let s = inputList[inputList.length - 1];
            outputList = [];

            for (let i in inputList) {
                e = inputList[i];

                if (this.pointIsInside(e, cp1, cp2, isClockwise)) {

                    if (!this.pointIsInside(s, cp1, cp2, isClockwise)) {
                        outputList.push(this.getIntersection(cp1, cp2, s, e));
                    }

                    outputList.push(e);
                }
                else if (this.pointIsInside(s, cp1, cp2, isClockwise)) {
                    outputList.push(this.getIntersection(cp1, cp2, s, e));
                }

                s = e;
            }

            yield outputList;

            cp1 = cp2;
        }

        return outputList;
    }

    pointIsInside(p, cp1, cp2, isClockwise) {
        let d = (cp2.y - cp1.y) * (p.x - cp1.x) - (cp2.x - cp1.x) * (p.y - cp1.y);
        return isClockwise ? d < 0 : d > 0;
    };

    getIntersection(cp1, cp2, s, e) {

        let dc = {
            x: cp1.x - cp2.x,
            y: cp1.y - cp2.y
        };

        let dp = {
            x: s.x - e.x,
            y: s.y - e.y
        };
        let n1 = cp1.x * cp2.y - cp1.y * cp2.x;
        let n2 = s.x * e.y - s.y * e.x;
        let n3 = 1.0 / (dc.x * dp.y - dc.y * dp.x);

        return {
            x: (n1 * dp.x - n2 * dc.x) * n3,
            y: (n1 * dp.y - n2 * dc.y) * n3
        };
    };

    polygonIsClockwise(polygon) {

        let product = 0;

        for (let i = 0; i < polygon.length; i++) {
            let p1 = polygon[i];
            let p2 = polygon[i + 1] || polygon[0];
            product += (p2.x - p1.x) * (p2.y + p1.y);
        }

        return product < 0;
    }

    /**
    * Рисует линию, отсекая ее, если флаг `this.clippingEnabled` установлен.
    * @param {point}  p1      первая точка
    * @param {point}  p2      вторая точка
    * @param {string} special указывает специальный тип линии ('moving' или 'dashed')
    */
    drawPolygon(polygon, fillStyle) {
        if (polygon.length === 0) {
            return;
        }

        let ctx = this.ctx;
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo(polygon[0].x, polygon[0].y);

        for (let i = 1; i < polygon.length; i++) {
            ctx.lineTo(polygon[i].x, polygon[i].y);
        }

        ctx.lineTo(polygon[0].x, polygon[0].y);
        ctx.fill();
        ctx.closePath();
    }

    /**
    * Конвертирует screen-space координаты в декартовые.
    * @param {point} p точка
    *
    * @return {point} Конвертированная точка.
    */
    convertToCartesianCoord(p) {
        return p && {
            x: Math.round(p.x),
            y: Math.round(this.height - p.y)
        };
    }
}
