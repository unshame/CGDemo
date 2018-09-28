/* exported Brush */
class Brush {

    /**
    * Кисть для рисования при помощи мыши.
    * @param {HTMLCanvasElement} canvas элемент холст
    * @param {string}            type   изначальный тип фигуры для рисования
    */
    constructor(canvas, type) {

        /**
        * Холст.
        * @type {HTMLCanvasElement}
        */
        this.canvas = canvas;

        /**
        * Рисует ли кисть в данный момент.
        * @type {Boolean}
        */
        this.isDown = false;

        /**
        * Начальная точка рисования.
        * @type {point}
        */
        this.p1 = null;

        /**
        * Конечная точка рисования.
        * @type {point}
        */
        this.p2 = null;

        /**
        * Обект рисуемой фигуры.
        * @type {object}
        */
        this.shape = null;

        /**
        * Тип рисуемой фигуры.
        * @type {string}
        */
        this.type = type;

        /**
        * Последнее обновление позиции кисти.
        * @type {Number}
        */
        this.lastUpdate = 0;

        /**
        * Интервал обновления кисти.
        * @type {Number}
        */
        this.updateInterval = 10;
    }

    /**
    * Устанавливает тип фигуры для рисования.
    * @param {string} type тип фигуры
    */
    setType(type) {

        if(this.isDown) {
            this.reset();
        }

        this.type = type;
        this.canvas.update();
    }

    /**
    * Начинает рисование, устанавливая начальную точку.
    * @param  {MouseEvent} event объект с информацией о событии
    */
    start(event) {

        if (this.isDown) {
            this.canvas.remove(this.shape);
        }

        this.p1 = { x: event.offsetX, y: event.offsetY };
        this.p2 = Object.assign({}, this.p1);
        this.shape = this.canvas.add(this.type, this.p1, this.p2, 'moving');
        this.isDown = true;
        this.lastUpdate = Date.now();
        this.canvas.update();
    }

    /**
    * Продолжает рисование, обновляя конечную точку и вызывая перерисовку холста.
    * @param  {MouseEvent} event объект с информацией о событии
    */
    update(event) {

        if (!this.isDown) {
            return;
        }

        let now = Date.now();

        if (now - this.lastUpdate < this.updateInterval) {
            return;
        }

        this.lastUpdate = now;

        this.shape.p2.x = event.offsetX;
        this.shape.p2.y = event.offsetY;
        this.canvas.update();
    }

    /**
    * Завершает рисование, обновляя конечную точку и вызывая перерисовку холста.
    * @param  {MouseEvent} event объект с информацией о событии
    */
    end(event) {

        if (!this.isDown) {
            return;
        }

        this.shape.p2.x = event.offsetX;
        this.shape.p2.y = event.offsetY;
        this.reset();
        this.canvas.update();
    }

    /**
    * Сбрасывает состояние объекта.
    */
    reset() {
        this.isDown = false;

        if(this.shape) {
            this.shape.special = '';
        }

        this.shape = null;
        this.p1 = null;
        this.p2 = null;
        this.lastUpdate = 0;
    }
}