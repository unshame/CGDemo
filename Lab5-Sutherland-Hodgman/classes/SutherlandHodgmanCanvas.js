/* exported SutherlandHodgmanCanvas */
class SutherlandHodgmanCanvas {

    /**
    * Холст для отсечения многоугольника многоугольником по алгоритму Сазерленда-Ходжмена.
    * @class
    * @param {HTMLCanvasElement} canvas          HTML-элемент холст
    * @param {number}            width           ширина холста
    * @param {number}            height          высота холста
    * @param {string}            subjectColor    цвет отсекаемого многоугольника
    * @param {string}            clippingColor   цвет отсекающего многоугольника
    * @param {string}            clippedColor    цвет отсеченного многоугольника
    * @param {point[]}           subjectPolygon  отсекаемый многоугольник
    * @param {boolean}           clippingEnabled будет ли скрыт отсекаемый прямоугольник
    * @param {number}            interval        интервал отсечения сторон
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

        /**
        * Отсекаемый многоугольник.
        * @type {point[]}
        */
        this.subjectPolygon = subjectPolygon.slice();

        /**
        * Отсекающий многоугольник.
        * @type {point[]}
        */
        this.clippingPolygon = [];

        /**
        * Будет ли скрыт отсекаемый прямоугольник.
        * @type {boolean}
        */
        this.clippingEnabled = clippingEnabled;

        /**
        * Цвет отсекаемого многоугольника.
        * @type {string}
        */
        this.subjectColor = subjectColor;
        /**
        * Цвет отсекающего многоугольника.
        * @type {string}
        */
        this.clippingColor = clippingColor;
        /**
        * Цвет отсеченного многоугольника.
        * @type {string}
        */
        this.clippedColor = clippedColor;

        /**
        * Интервал отсечения сторон.
        * @type {number}
        */
        this.interval = interval;
        this.int = null;

        this.resetClippingPolygon();
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

    /** Восстанавливает позицию отсекающего многоугольника. */
    resetClippingPolygon() {
        let w = this.width - 500;
        let h = this.height - 400;
        this.updateClippingPolygon(
            { x: this.width / 2 - w / 2, y: this.height / 2 - h / 2},
            { x: this.width / 2 + w / 2, y: this.height / 2 + h / 2}
        );
    }

    /**
     * Устанавливает вершины отсекающего многоугольника по двум точкам.
     * @param {point} p1 первая точка
     * @param {point} p2 вторая точка
     */
    updateClippingPolygon(p1, p2) {
        this.clippingPolygon.length = 0;
        this.clippingPolygon.push({x: p1.x, y: p1.y});
        this.clippingPolygon.push({x: p1.x, y: p2.y});
        this.clippingPolygon.push({x: p2.x, y: p2.y});
        this.clippingPolygon.push({x: p2.x, y: p1.y});
    }

    /** Отсекает многоугольник с текущими настройками. */
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

    /**
    * Пошагово отсекает многоугольник с текущими настройками.
    * @param {number} interval интервал отсечения
    */
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

    /**
    * Рисует отсекаемый, отсекающий и отсеченный многоугольники.
    * @param {point[]} clippedPolygon отсеченный многоугольник
    */
    drawPolygons(clippedPolygon) {
        this.drawPolygon(this.clippingPolygon, this.clippingColor);

        if (!this.clippingEnabled) {
            this.drawPolygon(this.subjectPolygon, this.subjectColor);
        }

        this.drawPolygon(clippedPolygon, this.clippedColor);
    }

    /** Устанавливает многугольники в положение по умолчанию. */
    clear() {
        this.resetClippingPolygon();
        this.update();
    }

    /**
    * Отсекает многоугольник, генерируя промежуточные стадии отсечения.
    * @see {@link https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm}
    * @param {point[]} subjectPolygon отсекаемый многоугольник
    * @param {point[]} clippingPolygon отсекающий многоугольник
    *
    * @return {point[]} отсеченный многоугольник.
    */
    *clipPolygon(subjectPolygon, clippingPolygon) {

        // Проверяем, что многоугольник задан по часовой стрелке
        let isClockwise = this.polygonIsClockwise(clippingPolygon);

        // Выходной массив - инициализируется отсекаемым многоугольником
        let outputList = subjectPolygon;

        yield outputList;

        // Первая точка отсекающей линии - инициализируется последней точкой отсекающего многоугольника
        let cp1 = clippingPolygon[clippingPolygon.length - 1];

        // Проходим по всем вершинам отсекающего многоугольника
        for (let j in clippingPolygon) {

            // Вторая точка отсекающей линии
            let cp2 = clippingPolygon[j];

            // Входной массив является выходным массивом предыдущей итерации
            let inputList = outputList;

            // Предыдущая точка стороны отсекаемого многоугольника
            // Инициализируется последней вершиной
            let s = inputList[inputList.length - 1];

            // Очищаем выходной массив
            outputList = [];

            // Проходим по всем точкам отсекаемого многоугольника
            for (let i in inputList) {

                // Текущая точка стороны отсекаемого многоугольника
                let e = inputList[i];

                // Если текущая точка внутри отсекающего многоугольника
                if (this.pointIsInside(e, cp1, cp2, isClockwise)) {

                    // а предыдущая снаружи
                    if (!this.pointIsInside(s, cp1, cp2, isClockwise)) {

                        // то находим точку пересечения стороны с прямой и кладем ее в выходной массив
                        outputList.push(this.getIntersection(cp1, cp2, s, e));
                    }

                    // Добавляем текущую точку в массив
                    outputList.push(e);
                }
                else if (this.pointIsInside(s, cp1, cp2, isClockwise)) {

                    // иначе, если предыдущая точка находится внутри, находим пересечение и добавляем в массив
                    outputList.push(this.getIntersection(cp1, cp2, s, e));
                }

                // Переходим к следующей точке входного массива
                s = e;
            }

            // Переходим к следующей вершине отсекающего многоугольника
            cp1 = cp2;

            yield outputList;
        }

        // Возвращаем отсеченный многоугольник
        return outputList;
    }

    /**
    * Проверяет, что точка находится с правильной стороны линии.
    * @param {point}   p           точка, положение которой ищется
    * @param {point}   cp1         первая точка прямой
    * @param {point}   cp2         вторая точка прямой
    * @param {boolean} isClockwise указывает, какая сторона является правильной
    *
    * @return {boolean}
    */
    pointIsInside(p, cp1, cp2, isClockwise) {
        let d = (cp2.y - cp1.y) * (p.x - cp1.x) - (cp2.x - cp1.x) * (p.y - cp1.y);
        return isClockwise ? d < 0 : d > 0;
    };

    /**
    * Находит пересечение двух отрезков.
    * @see {@link http://paulbourke.net/geometry/pointlineplane/}.
    * @param {point} cp1 первая точка первого отрезка
    * @param {point} cp2 вторая точка первого отрезка
    * @param {point} s   первая точка второго отрезка
    * @param {point} e   вторая точка второго отрезка
    *
    * @return {point}
    */
    getIntersection(cp1, cp2, s, e) {

        let denominator = ((e.y - s.y) * (cp2.x - cp1.x) - (e.x - s.x) * (cp2.y - cp1.y));

        let ua = ((e.x - s.x) * (cp1.y - s.y) - (e.y - s.y) * (cp1.x - s.x)) / denominator;

        let x = cp1.x + ua * (cp2.x - cp1.x);
        let y = cp1.y + ua * (cp2.y - cp1.y);

        return { x, y };
    };

    /**
    * Проверяет, задан ли многоугольник по часовой стрелке или против по формуле площади Гаусса.
    * @param {point[]} polygon многоугольник
    *
    * @return {boolean}
    */
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
    * Рисует многоугольник.
    * @param {point[]} polygon   многоугольник
    * @param {string}  fillStyle цвет заливки
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
}
