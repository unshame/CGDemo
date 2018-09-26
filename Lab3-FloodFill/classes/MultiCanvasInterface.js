class MultiCanvasInterface {

    constructor(primaryCanvas, secondaryCanvas) {
        this.primaryCanvas = primaryCanvas;
        this.secondaryCanvas = secondaryCanvas;
    }

    fill(p) {
        this.primaryCanvas.fill(p);
        this.secondaryCanvas.fill(p);
    }

    fillStep(p, interval) {
        this.primaryCanvas.fillStep(p, interval);
        this.secondaryCanvas.fillStep(p, interval);
    }

    reset() {
        this.primaryCanvas.reset();
        this.secondaryCanvas.clearIntervals();
        this.secondaryCanvas.renderer.ctx.putImageData(this.primaryCanvas.renderer.canvasData, 0, 0);
        this.secondaryCanvas.renderer.restore();
        this.secondaryCanvas.renderer.update();
    }

}