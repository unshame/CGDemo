/* exported Polygon */
class Polygon {

    constructor(ps, angle, speed) {
        this.ps = [{...ps[0]}];

        for(let i = 1; i < ps.length; i++) {
            let pp = ps[i];
            this.ps.push({
                x: this.ps[0].x + pp.x,
                y: this.ps[0].y + pp.y
            });
        }

        this.setAngleSpeed(angle, speed);
        this.calculateBoundingBox();
    }

    get angle() {
        return this._angle;
    }

    set angle(value) {
        this._angle = value;
        [this.dx, this.dy] = this.getDeltaCoords(value, this.speed);
    }

    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = value;
        [this.dx, this.dy] = this.getDeltaCoords(this.angle, value);
    }

    setAngleSpeed(angle, speed) {
        this._angle = angle;
        this._speed = speed;
        [this.dx, this.dy] = this.getDeltaCoords(angle, speed);
    }

    getDeltaCoords(angle, speed) {
        let toDegrees = (Math.PI / 180);
        let dx = speed * Math.cos(angle * toDegrees);
        let dy = speed * Math.sin(angle * toDegrees);
        return [dx, dy];
    }

    get position() {
        return {...this.ps[0]};
    }

    set position(p) {
        let dx = p.x - this.ps[0].x;
        let dy = p.y - this.ps[0].y;

        this.ps[0] = {x: p.x, y: p.y};

        for(let i = 1; i < this.ps.length; i++) {
            this.ps[i].x += dx;
            this.ps[i].y += dy;
        }
    }

    move(p) {
        for (let i = 0; i < this.ps.length; i++) {
            this.ps[i].x += p.x;
            this.ps[i].y += p.y;
        }
    }

    calculateBoundingBox() {
        let p = this.position;
        let xs = this.ps.map(p => p.x);
        let ys = this.ps.map(p => p.y);
        let minx = Math.min(...xs) - p.x;
        let maxx = Math.max(...xs) - p.x;
        let miny = Math.min(...ys) - p.y;
        let maxy = Math.max(...ys) - p.y;
        this._boundingBox = [
            { x: minx, y: miny },
            { x: maxx, y: maxy }
        ];
    }

    get boundingBox() {
        let position = this.position;
        let boundingBox = this._boundingBox.map(p => {
            return {
                x: position.x + p.x,
                y: position.y + p.y
            };
        });
        return boundingBox;
    }

    changeDirection(collision) {

        if(collision.top || collision.bottom) {
            this.dy = -this.dy;
        }

        if (collision.left || collision.right) {
            this.dx = -this.dx;
        }
    }
}