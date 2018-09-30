/* exported CanvasInterface */
class CanvasInterface {

    constructor(canvas, width, height, color, eraserType) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.color = color;

        this.polygons = [];
        this.eraserType = eraserType;
        this.isRunning = false;
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

    /**
    * Цвет рисования на холсте.
    * @type {number[]}
    */
    get color() {
        return this._color;
    }

    set color(color) {
        this._color = color.slice();
        this.ctx.strokeStyle = `rgba(${color.join(',')})`;
    }

    addPolygon(ps, angle, speed) {
        let polygon = new Polygon(ps, angle, speed);
        this.polygons.push(polygon);

        return polygon;
    }

    drawPolygon(ps) {

        if (ps.length === 0) {
            return;
        }

        let ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(ps[0].x, ps[0].y);

        for (let i = 1; i < ps.length; i++) {
            ctx.lineTo(ps[i].x, ps[i].y);
        }

        ctx.lineTo(ps[0].x, ps[0].y);
        ctx.stroke();
        ctx.closePath();
    }

    setInterval(interval) {

        if(this.isRunning) {
            clearInterval(this.isRunning);
            this.isRunning = false;
        }

        if(typeof interval != 'number' || isNaN(interval) || interval < 0) {
            return;
        }

        let lastUpdate = Date.now();

        this.isRunning = setInterval(() => {
            let now = Date.now();
            this.update(now - lastUpdate);
            lastUpdate = now;
        }, interval);
    }

    update(dt) {
        this.clear();

        for(let polygon of this.polygons) {
            this.updatePolygon(polygon, dt);
        }
    }

    updatePolygon(polygon, dt) {
        let dtt = dt / 1000;

        polygon.updateSize(dt);
        polygon.move({ x: polygon.dx * dtt, y: polygon.dy * dtt});
        let collision = this.getCollision(polygon.boundingBox);

        if(collision.collided) {
            polygon.move({x: collision.dx, y: collision.dy});
            polygon.changeDirection(collision);
            //polygon.move({ x: polygon.dx * dtt, y: polygon.dy * dtt});
        }

        this.drawPolygon(polygon.ps);
    }

    getCollision(boundingBox) {
        let left = Math.min(boundingBox[0].x, 0);
        let right = Math.min(this.width - 1 - boundingBox[1].x, 0);
        let top = Math.min(boundingBox[0].y, 0);
        let bottom = Math.min(this.height - 1 - boundingBox[1].y, 0);

        let dx = left < 0 ? -left : (right < 0 ? right : 0);
        let dy = top < 0 ? -top : (bottom < 0 ? bottom : 0);

        let collided = 0;

        if(top) {
            collided |= COLLISION.TOP;
        }

        if (right) {
            collided |= COLLISION.RIGHT;
        }

        if (bottom) {
            collided |= COLLISION.BOTTOM;
        }

        if (left) {
            collided |= COLLISION.LEFT;
        }

        return {
            collided,
            dx, dy
        };
    }

    clear() {
        switch (this.eraserType) {

            case 'boxClear':
                this.clearBox();
                break;

            case 'fullClear':
                this.clearFull();
                break;
        }
    }

    clearFull() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    clearBox() {

        for(let polygon of this.polygons) {
            let boundingBox = polygon.boundingBox;
            let x = Math.floor(boundingBox[0].x) - 1;
            let y = Math.floor(boundingBox[0].y) - 1;
            let width = Math.ceil(boundingBox[1].x) - x + 1;
            let height = Math.ceil(boundingBox[1].y) - y + 1;
            this.ctx.clearRect(x, y, width, height);
        }
    }

    reset() {
        this.clearFull();
        this.polygons.length = 0;
    }
}

let COLLISION = {
    TOP: 0b0001,
    RIGHT: 0b0010,
    BOTTOM: 0b0100,
    LEFT: 0b1000,
    TOPBOTTOM: 0b0101,
    LEFTRIGHT: 0b1010
};