/* exported MultiCanvasInterface */
class MultiCanvasInterface {

    /**
    * Интерфейс для работы с двумя холстами как с одним.
    * @class
    * @param {AbstractFloodFillCanvas} primaryCanvas   основной холст
    * @param {AbstractFloodFillCanvas} secondaryCanvas второстепенный холст
    */
    constructor(primaryCanvas, secondaryCanvas) {
        this.primaryCanvas = primaryCanvas;
        this.secondaryCanvas = secondaryCanvas;
    }

    /**
    * Заливает холсты с заданной точки.
    * @param {point} p точка начала залива
    */
    fill(p) {
        this.primaryCanvas.fill(p);
        this.secondaryCanvas.fill(p);
    }

    /**
    * Пошагово заливает холсты с заданной точки.
    * @param {point}  p        точка начала залива
    * @param {number} interval интервал шага
    */
    fillStep(p, interval) {
        this.primaryCanvas.fillStep(p, interval);
        this.secondaryCanvas.fillStep(p, interval);
    }

    /** Очищает холсты и идеентично заполняет их многоугольниками. */
    reset() {
        this.primaryCanvas.reset();
        this.secondaryCanvas.clearIntervals();
        this.secondaryCanvas.renderer.ctx.putImageData(this.primaryCanvas.renderer.canvasData, 0, 0);
        this.secondaryCanvas.renderer.restore();
        this.secondaryCanvas.renderer.update();
    }

}