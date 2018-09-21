/* exported Brush */
class Brush {

    constructor(canvas, type) {
        this.canvas = canvas;
        this.isDown = false;
        this.p1 = null;
        this.p2 = null;
        this.shape = null;
        this.type = type;
    }

    setType(type) {
        if(this.isDown) {
            this.reset();
        }

        this.type = type;
        this.canvas.update();
    }

    start(event) {
        this.p1 = { x: event.offsetX, y: event.offsetY };
        this.p2 = Object.assign({}, this.p1);
        this.shape = this.canvas.add(this.type, this.p1, this.p2);
        this.isDown = true;
    }

    update() {
        if (!this.isDown) {
            return;
        }

        this.shape.p2.x = event.offsetX;
        this.shape.p2.y = event.offsetY;
        this.canvas.update();
    }

    end(event) {
        if (!this.isDown) {
            return;
        }

        this.shape.p2.x = event.offsetX;
        this.shape.p2.y = event.offsetY;
        this.reset();
        this.canvas.update();
    }

    reset() {
        this.isDown = false;
        this.shape = null;
        this.p1 = null;
        this.p2 = null;
    }
}