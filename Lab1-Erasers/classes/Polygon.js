/* exported Polygon */
class Polygon {

    constructor(ps, angle, speed) {
        this.ps = [{x: ps[0].x, y:ps[0].y}];
        this.initialPoints = [];

        for(let i = 1; i < ps.length; i++) {
            let pp = ps[i];

            this.ps.push({
                x: this.ps[0].x + pp.x,
                y: this.ps[0].y + pp.y
            });

            this.initialPoints.push({
                x: pp.x,
                y: pp.y
            });
        }

        this.setAngleSpeed(angle, speed);
        this.calculateBoundingBox();
        this.currentSizePercentage = 1;
        this.resizeEnabled = false;
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
        return Object.assign({}, this.ps[0]);
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

        let direction = this.getDirection();

        if ((collision.collided & COLLISION.TOPBOTTOM) && !(collision.collided & direction & COLLISION.TOPBOTTOM)) {
            this.dy = -this.dy;
        }

        if ((collision.collided & COLLISION.LEFTRIGHT) && !(collision.collided & direction & COLLISION.LEFTRIGHT)) {
            this.dx = -this.dx;
        }
    }

    getDirection() {
        let direction = 0;

        if (this.dx > 0) {
            direction |= COLLISION.LEFT;
        }
        else if (this.dx < 0) {
            direction |= COLLISION.RIGHT;
        }

        if (this.y > 0) {
            direction |= COLLISION.BOTTOM;
        }
        else if (this.y < 0) {
            direction |= COLLISION.TOP;
        }

        return direction;
    }

    setResizeProperties(resizeEnabled, min, max, step, dir) {
        this.resizeEnabled = resizeEnabled;
        this.minSizePercentage = min;
        this.maxSizePercentage = max;
        this.resizeStep = step;
        this.resizeDirection = dir;
    }

    updateSize(dt) {

        if(!this.resizeEnabled) {
            return;
        }

        let step = this.resizeStep * (dt / 1000);
        let max = this.maxSizePercentage;
        let min = this.minSizePercentage;

        if (this.resizeDirection === 1) {
            this.currentSizePercentage += step;
            if (this.currentSizePercentage >= max) {
                this.currentSizePercentage = max;
                this.resizeDirection = -1;
            }
        }
        else {
            this.currentSizePercentage -= step;
            if (this.currentSizePercentage <= min) {
                this.currentSizePercentage = min;
                this.resizeDirection = 1;
            }
        }

        let position = this.position;
        for(let i = 1; i < this.ps.length; i++) {
            let p = this.ps[i];
            p.x = this.initialPoints[i - 1].x * this.currentSizePercentage +  position.x;
            p.y = this.initialPoints[i - 1].y * this.currentSizePercentage +  position.y;
        }

        this.calculateBoundingBox();
    }
}