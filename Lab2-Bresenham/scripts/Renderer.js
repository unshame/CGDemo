/* exported Renderer */
class Renderer {

    constructor(canvas, width, height, color) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.canvasData = this.ctx.getImageData(0, 0, width, height);
        this.color = color;
    }

    get width() {
        return this.canvas.width;
    }

    set width(width) {
        this.canvas.width = width;
    }

    get height() {
        return this.canvas.height;
    }

    set height(height) {
        this.canvas.height = height;
    }

    update() {
        this.ctx.putImageData(this.canvasData, 0, 0);
    }

    drawPixel(p, color) {
        if (!this.pixelIsInside(p)) {
            return;
        }

        let index = (p.x + p.y * this.width) * 4;
        let canvasData = this.canvasData;

        canvasData.data[index] = color[0];
        canvasData.data[index + 1] = color[1];
        canvasData.data[index + 2] = color[2];
        canvasData.data[index + 3] = color[3];
    }

    drawColoredPixel(p) {
        this.drawPixel(p, this.color);
    }

    drawClearPixel(p) {
        this.drawPixel(p, [255, 255, 255, 0]);
    }

    clearCanvas() {
        let canvasData = this.canvasData;

        for (let i = 3; i < canvasData.data.length; i += 4) {
            canvasData.data[i] = 0;
        }
    }

    clearRect(p1, p2) {

        for (let x = p1.x; x <= p2.x; x++) {

            for (let y = p1.y; y <= p2.y; y++) {
                this.drawClearPixel({ x, y });
            }
        }
    }

    pixelIsInside(p) {
        return p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height;
    }

}