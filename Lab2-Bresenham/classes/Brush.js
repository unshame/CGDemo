/* exported Brush */
class Brush {

    /**
    * Кисть для рисования при помощи мыши.
    * @param  {HTMLCanvasElement} canvas HTML-элемент холст
    * @param  {string} type   изначальный тип фигуры для рисования
    */
    constructor(canvas, type) {
        this.canvas = canvas;
        this.isDown = false;
        this.p1 = null;
        this.p2 = null;
        this.shape = null;
        this.type = type;
        this.lastUpdate = 0;
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

        if(this.isDown) {
            this.canvas.remove(this.shape);
        }

        this.p1 = { x: event.offsetX, y: event.offsetY };
        this.p2 = Object.assign({}, this.p1);
        this.shape = this.canvas.add(this.type, this.p1, this.p2);
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
        this.shape = null;
        this.p1 = null;
        this.p2 = null;
        this.lastUpdate = 0;
    }
}