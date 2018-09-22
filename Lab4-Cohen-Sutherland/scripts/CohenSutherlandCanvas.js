/* exported CohenSutherlandCanvas */
class CohenSutherlandCanvas {

    /**
    * Холст для рисования линий и окружностей по алгоритму Брезенхема.
    * Конструктор создает рендерер для рисования пикселей на холсте и массив для хранения фигур для рисования.
    * @class
    * @param {HTMLCanvasElement} canvas  HTML-элемент холст
    * @param {number}            width   ширина холста
    * @param {number}            height  высота холста
    * @param {array}             color   цвет рисования по холсту [r, g, b, a]
    */
    constructor(canvas, width, height, color, enabled) {

        this.clippingEnabled = enabled;

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
        * Установленный цвет рисования на холсте.
        * @type {array}
        */
        this.color = color;

        /**
        * Массив с фигурами для рисования.
        * @type {RenderArray}
        */
        this.shapes = new RenderArray();

        this.rectangle = {
            type: 'rectangle',
            p1: {},
            p2: {},
            properties: null
        };

        this.dashedLines = [];
        for(let i = 0; i < 4; i++) {
            this.dashedLines.push(this.add('line', { x: 0, y: 0 }, { x: 0, y: 0 }, false, true));
        }

        this.shapes.add(this.rectangle);

        this.resetRectangle();
        this.update();
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
        return this.ctx.strokeStyle;
    }

    set color(color) {
        this.ctx.strokeStyle = `rgba(${color.join(',')})`;
    }

    resetRectangle() {
        let w = this.width - 300;
        let h = this.height - 200;
        this.rectangle.type = 'rectangle';
        this.rectangle.p1.x = this.width / 2 - w / 2;
        this.rectangle.p1.y = this.height / 2 - h / 2;
        this.rectangle.p2.x = this.width / 2 + w / 2;
        this.rectangle.p2.y = this.height / 2 + h / 2;
        this.rectangle.properties = null;
    }

    updateRectangleProperties() {
        let p1 = this.rectangle.p1;
        let p2 = this.rectangle.p2;
        let pr = this.rectangle.properties = {
            w: p2.x - p1.x,
            h: p2.y - p1.y,
            xmin: Math.min(p1.x, p2.x),
            xmax: Math.max(p1.x, p2.x),
            ymin: Math.min(p1.y, p2.y),
            ymax: Math.max(p1.y, p2.y)
        };

        this.dashedLines[0].p1.x = 0;
        this.dashedLines[0].p1.y = pr.ymin;
        this.dashedLines[0].p2.x = this.width;
        this.dashedLines[0].p2.y = pr.ymin;

        this.dashedLines[1].p1.x = 0;
        this.dashedLines[1].p1.y = pr.ymax;
        this.dashedLines[1].p2.x = this.width;
        this.dashedLines[1].p2.y = pr.ymax;

        this.dashedLines[2].p1.x = pr.xmin;
        this.dashedLines[2].p1.y = 0;
        this.dashedLines[2].p2.x = pr.xmin;
        this.dashedLines[2].p2.y = this.height;

        this.dashedLines[3].p1.x = pr.xmax;
        this.dashedLines[3].p1.y = 0;
        this.dashedLines[3].p2.x = pr.xmax;
        this.dashedLines[3].p2.y = this.height;
    }

    /**
    * Создает, добавляет в массив и возвращает фигуру для рисования.
    * @param {string} type  тип фигуры ('line' или 'circle')
    * @param {point}  p1    первая точка
    * @param {point}  p2    вторая точка
    *
    * @return {object} Фигура в виде {type, p1, p2}.
    */
    add(type, p1, p2, moving, dashed) {

        if (type == 'rectangle') {
            this.rectangle.p1.x = p1.x;
            this.rectangle.p1.y = p1.y;
            this.rectangle.p2.x = p2.x;
            this.rectangle.p2.y = p2.y;
            return this.rectangle;
        }

        let shape = {
            type: type,
            p1, p2, moving, dashed
        };

        this.shapes.add(shape);
        return shape;
    }

    /* Очищает холст и выводит все фигуры из массива. */
    update() {
        this.updateRectangleProperties();

        this.ctx.clearRect(0, 0, this.width, this.height);

        for(let shape of this.shapes.array) {
            this[this.getDrawMethodName(shape.type)](shape.p1, shape.p2, shape.moving, shape.dashed);
        }
    }

    /**
    * Возвращает названия метода для рисования на основе типа фигуры.
    * @param  {string} type  тип фигуры ('line' или 'circle')
    *
    * @return {string} Названия метода для рисования.
    */
    getDrawMethodName(type) {
        return 'draw' + type.charAt(0).toUpperCase() + type.substring(1);
    }

    /** Очищает массив и холст. */
    clear() {
        this.shapes.clear();

        for (let line of this.dashedLines) {
            this.shapes.add(line);
        }

        this.shapes.add(this.rectangle);

        this.resetRectangle();
        this.update();
    }

    /**
    * Рисует линию по алгоритму.
    * @param {point}  p1    первая точка
    * @param {point}  p2    вторая точка
    */
    drawLine(p1, p2, moving, dashed) {

        if (this.clippingEnabled && !moving && !dashed) {
            [p1, p2] = this.clipLine(p1, p2);
        }

        if(!p1 || !p2) {
            return;
        }

        let ctx = this.ctx;
        ctx.lineWidth = dashed ? 2 : 1;
        ctx.setLineDash(dashed ? [5, 2] : []);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    /**
    * Рисует круг по алгоритму.
    * @param {point}  p1    первая точка
    * @param {point}  p2    вторая точка
    */
    drawRectangle(p1, p2) {
        let w = p2.x - p1.x;
        let h = p2.y - p1.y;
        let ctx = this.ctx;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(p1.x, p1.y, w, h);
    }

    clipLine(start, end) {

        let o1 = this.getOutCode(start);
        let o2 = this.getOutCode(end);

        //Both the outcodes are 0. This means both end points are inside the viewport
        if (o1 == 0 && o2 == 0) {
            return [start, end];
        }

        //both the outcodes have the same bit set when both end points are outside viewport
        else if ((o1 & o2) != 0) {
            return [null, null];
        }

        //When both end points are outside viewport but portion of line is inside
        else {
            let newStart = start;
            let newEnd = end;

            if (o1 != 0) {
                let intersections = this.findIntersections(o1, start, end);
                newStart = this.findFurthestIntersection(start, intersections);
            }

            if (o2 != 0) {
                let intersections = this.findIntersections(o2, start, end);
                newEnd = this.findFurthestIntersection(end, intersections);
            }

            let startNewStart = this.getDistance(start, newStart);
            let startNewEnd = this.getDistance(start, newEnd);
            let endNewEnd = this.getDistance(end, newEnd);
            let endNewStart = this.getDistance(end, newStart);

            if (startNewStart > startNewEnd || endNewEnd > endNewStart) {
                return [null, null];
            }

            return [newStart, newEnd];
        }
    }

    getOutCode(p) {
        let outcode = 0b0000;

        let x = p.x;
        let y = p.y;
        let pr = this.rectangle.properties;

        if (y > pr.ymax){
            outcode |= 0b1000;
        }

        if (y < pr.ymin){
            outcode |= 0b0100;
        }

        if (x > pr.xmax){
            outcode |= 0b0010;
        }

        if (x < pr.xmin){
            outcode |= 0b0001;
        }

        return outcode;
    }

    findFurthestIntersection(p, intersections) {
        let furthest = intersections[0];
        let longestDistance = this.getDistance(p, furthest);

        for (let i = 1; i < intersections.length; i++) {
            let distance = this.getDistance(p, intersections[i]);
            if (distance > longestDistance) {
                longestDistance = distance;
                furthest = intersections[i];
            }
        }

        return furthest;
    }

    findIntersections(outcode, start, end) {

        //All lines are of the form y = mx + c
        //m = (y2-y1)/(x2-x1)
        let x1 = start.x;
        let x2 = end.x;
        let y1 = start.y;
        let y2 = end.y;

        let pr = this.rectangle.properties;

        //Keeps track of all intersections
        //We use a list because if the outcode contains 2 '1's, we need to calculate 2 intersections
        let intersections = [];

        //find slope
        let m = (y2 - y1) / (x2 - x1);

        //find constant 'c' by substituting one of the end points for x and y
        let c = y1 - m * x1;

        if ((outcode & 0b1000) != 0) {
            //intersection is on the line x=ymax
            //The abscissa of intersect is to be calculated as (x, ymax)
            //Ordinate of intersect is same as ymax
            intersections.push({
                x: (pr.ymax - c) / m,
                y: pr.ymax
            });
        }

        if ((outcode & 0b0100) != 0) {
            //Intersection is on the line x=ymin

            intersections.push({
                x: (pr.ymin - c) / m,
                y: pr.ymin
            });
        }

        if ((outcode & 0b0010) != 0) {
            //Intersection on line y=xmax
            //The abscissa of intersect is same as xmax
            //The ordinate of intersect is to be calculated
            intersections.push({
                x: pr.xmax,
                y: (m * pr.xmax + c)
            });
        }

        if ((outcode & 0b0001) != 0) {
            //Intersection is on the line y=xmin
            intersections.push({
                x: pr.xmin,
                y: (m * pr.xmin + c)
            });
        }

        return intersections;
    }

    getDistance(p1, p2) {
        let dx = Math.abs(p2.x - p1.x);
        let dy = Math.abs(p2.y - p1.y);
        return Math.sqrt(dx * dx + dy * dy);
    }


}