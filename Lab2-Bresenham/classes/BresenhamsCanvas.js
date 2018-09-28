/* exported BresenhamsCanvas */
class BresenhamsCanvas {

    /**
    * Холст для рисования линий и окружностей по алгоритму Брезенхема.
    * Конструктор создает рендерер для рисования пикселей на холсте и массив для хранения фигур для рисования.
    * @class
    * @param {HTMLCanvasElement} canvas  HTML-элемент холст
    * @param {number}            width   ширина холста
    * @param {number}            height  высота холста
    * @param {array}             color   цвет рисования по холсту [r, g, b, a]
    */
    constructor(canvas, width, height, color) {

        /**
        * Объект, рисующий пиксели на холсте.
        * @type {Renderer}
        */
        this.renderer = new Renderer(canvas, width, height, color);

        /**
        * Массив с фигурами для рисования.
        * @type {RenderArray}
        */
        this.shapes = new RenderArray();
    }

    /**
    * Создает, добавляет в массив и возвращает фигуру для рисования.
    * @param {string} type  тип фигуры ('line' или 'circle')
    * @param {point}  p1    первая точка
    * @param {point}  p2    вторая точка
    *
    * @return {object} Фигура в виде {type, p1, p2}.
    */
    add(type, p1, p2) {

        let shape = {
            type: type,
            p1, p2
        };

        this.shapes.add(shape);
        return shape;
    }

    remove(shape) {
        this.shapes.remove(shape);
    }

    /* Очищает холст и выводит все фигуры из массива. */
    update() {
        this.renderer.clearCanvas();

        for(let shape of this.shapes.array) {
            this[this.getDrawMethodName(shape.type)](shape.p1, shape.p2);
        }

        this.renderer.update();
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
        this.update();
    }

    /**
    * Рисует линию по алгоритму.
    * @param {point}  p1    первая точка
    * @param {point}  p2    вторая точка
    */
    drawLine(p1, p2) {
        let dx = Math.abs(p2.x - p1.x);
        let dy = Math.abs(p2.y - p1.y);
        let sx = (p1.x < p2.x) ? 1 : -1;
        let sy = (p1.y < p2.y) ? 1 : -1;
        let err = dx - dy;
        let p = { x: p1.x, y: p1.y };

        while (true) {

            this.renderer.drawColoredPixel(p);

            if (p.x == p2.x && p.y == p2.y) {
                break;
            }

            let e2 = 2 * err;

            if (e2 > -dy) {
                err -= dy;
                p.x += sx;
            }

            if (e2 < dx) {
                err += dx;
                p.y += sy;
            }
        }
    }

    /**
    * Рисует круг по алгоритму.
    * @param {point}  p1    первая точка
    * @param {point}  p2    вторая точка
    */
    drawCircle(p1, p2) {

        // Вычисляем радиус по двум точкам
        let lx = Math.abs(p2.x - p1.x);
        let ly = Math.abs(p2.y - p1.y);
        let radius = Math.round(Math.sqrt(lx * lx + ly * ly));

        let x = radius - 1;
        let y = 0;
        let dx = 1;
        let dy = 1;
        let diameter = radius * 2;
        let err = dx - diameter;

        while (x >= y) {
            this.renderer.drawColoredPixel({x: x + p1.x, y: y + p1.y});
            this.renderer.drawColoredPixel({x: y + p1.x, y: x + p1.y});
            this.renderer.drawColoredPixel({x: -x + p1.x, y: y + p1.y});
            this.renderer.drawColoredPixel({x: -y + p1.x, y: x + p1.y});
            this.renderer.drawColoredPixel({x: -x + p1.x, y: -y + p1.y});
            this.renderer.drawColoredPixel({x: -y + p1.x, y: -x + p1.y});
            this.renderer.drawColoredPixel({x: x + p1.x, y: -y + p1.y});
            this.renderer.drawColoredPixel({x: y + p1.x, y: -x + p1.y});

            if (err <= 0) {
                y++;
                err += dy;
                dy += 2;
            }

            if (err > 0) {
                x--;
                dx += 2;
                err += dx - diameter;
            }
        }
    }
}