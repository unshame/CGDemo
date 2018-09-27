/* exported Brush */
class Brush {

    /**
    * Кисть для рисования при помощи мыши.
    * @param {CohenSutherlandCanvas}
    */
    constructor(canvasInterface) {

        /**
        * Холст.
        * @type {CohenSutherlandCanvas}
        */
        this.canvasInterface = canvasInterface;

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
    * Начинает рисование, устанавливая начальную точку.
    * @param  {MouseEvent} event объект с информацией о событии
    */
    start(event) {
        this.p1 = { x: event.offsetX, y: event.offsetY };
        this.p2 = Object.assign({}, this.p1);
        this.canvasInterface.updateClippingPolygon(this.p1, this.p2);
        this.isDown = true;
        this.lastUpdate = Date.now();
        this.savedClippingEnabled = this.canvasInterface.clippingEnabled;
        this.canvasInterface.clippingEnabled = false;
        this.canvasInterface.update();
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

        this.p2.x = event.offsetX;
        this.p2.y = event.offsetY;
        this.canvasInterface.clippingEnabled = false;
        this.canvasInterface.updateClippingPolygon(this.p1, this.p2);
        this.canvasInterface.update();
    }

    /**
    * Завершает рисование, обновляя конечную точку и вызывая перерисовку холста.
    * @param  {MouseEvent} event объект с информацией о событии
    */
    end(event) {

        if (!this.isDown) {
            return;
        }

        this.p2.x = event.offsetX;
        this.p2.y = event.offsetY;
        this.canvasInterface.clippingEnabled = this.savedClippingEnabled;
        this.canvasInterface.updateClippingPolygon(this.p1, this.p2);
        this.reset();
        this.canvasInterface.updateStep();
    }

    /**
    * Сбрасывает состояние объекта.
    */
    reset() {
        this.isDown = false;
        this.p1 = null;
        this.p2 = null;
        this.lastUpdate = 0;
        this.savedClippingEnabled = undefined;
    }
}