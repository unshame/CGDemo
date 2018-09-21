/* exported BresenhamsCanvas */
class BresenhamsCanvas {

    constructor(canvas, width, height, color) {
        this.renderer = new Renderer(canvas, width, height, color);
        this.stack = new RenderStack();
    }

    add(type, p1, p2) {
        let shape = {
            type: type,
            p1, p2
        };
        this.stack.push(shape);
        return shape;
    }

    update() {
        this.renderer.clearCanvas();
        for(let shape of this.stack.stack) {
            this[this.getDrawMethodName(shape.type)](shape.p1, shape.p2);
        }
        this.renderer.update();
    }

    getDrawMethodName(type) {
        return 'draw' + type.charAt(0).toUpperCase() + type.substring(1);
    }

    drawLine(p1, p2) {
        let dx = Math.abs(p2.x - p1.x);
        let dy = Math.abs(p2.y - p1.y);
        let sx = (p1.x < p2.x) ? 1 : -1;
        let sy = (p1.y < p2.y) ? 1 : -1;
        let err = dx - dy;
        let p = { x: p1.x, y: p1.y };

        while (true) {

            this.renderer.drawColoredPixel(p);

            if (p.x == p2.x && p.y == p2.y) {
                break;
            }

            let e2 = 2 * err;

            if (e2 > -dy) {
                err -= dy;
                p.x += sx;
            }

            if (e2 < dx) {
                err += dx;
                p.y += sy;
            }
        }
    }

    drawCircle(p1, p2) {
        let lx = Math.abs(p2.x - p1.x);
        let ly = Math.abs(p2.y - p1.y);
        let radius = Math.round(Math.sqrt(lx * lx + ly * ly));
        let x = radius - 1;
        let y = 0;
        let dx = 1;
        let dy = 1;
        let diameter = radius * 2;
        let err = dx - diameter;

        while (x >= y) {
            this.renderer.drawColoredPixel({x: x + p1.x, y: y + p1.y});
            this.renderer.drawColoredPixel({x: y + p1.x, y: x + p1.y});
            this.renderer.drawColoredPixel({x: -x + p1.x, y: y + p1.y});
            this.renderer.drawColoredPixel({x: -y + p1.x, y: x + p1.y});
            this.renderer.drawColoredPixel({x: -x + p1.x, y: -y + p1.y});
            this.renderer.drawColoredPixel({x: -y + p1.x, y: -x + p1.y});
            this.renderer.drawColoredPixel({x: x + p1.x, y: -y + p1.y});
            this.renderer.drawColoredPixel({x: y + p1.x, y: -x + p1.y});

            if (err <= 0) {
                y++;
                err += dy;
                dy += 2;
            }

            if (err > 0) {
                x--;
                dx += 2;
                err += dx - diameter;
            }
        }
    }

    clear() {
        this.stack.clear();
        this.update();
    }
}