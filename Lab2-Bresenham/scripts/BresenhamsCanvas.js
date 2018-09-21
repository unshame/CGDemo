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
        let x0 = p1.x;
        let y0 = p1.y;
        let lx = Math.abs(p2.x - p1.x);
        let ly = Math.abs(p2.y - p1.y);
        let radius = Math.round(Math.sqrt(lx * lx + ly * ly));
        var x = radius - 1;
        var y = 0;
        var dx = 1;
        var dy = 1;
        var diameter = radius * 2;
        var decisionOver2 = dx - diameter;   // Decision criterion divided by 2 evaluated at x=r, y=0

        while (x >= y) {
            this.renderer.drawColoredPixel({x: x + x0, y: y + y0});
            this.renderer.drawColoredPixel({x: y + x0, y: x + y0});
            this.renderer.drawColoredPixel({x: -x + x0, y: y + y0});
            this.renderer.drawColoredPixel({x: -y + x0, y: x + y0});
            this.renderer.drawColoredPixel({x: -x + x0, y: -y + y0});
            this.renderer.drawColoredPixel({x: -y + x0, y: -x + y0});
            this.renderer.drawColoredPixel({x: x + x0, y: -y + y0});
            this.renderer.drawColoredPixel({x: y + x0, y: -x + y0});

            if (decisionOver2 <= 0) {
                y++;
                decisionOver2 += dy; // Change in decision criterion for y -> y+1
                dy += 2;
            }

            if (decisionOver2 > 0) {
                x--;
                dx += 2;
                decisionOver2 += (-diameter) + dx; // Change for y -> y+1, x -> x-1
            }
        }
    }

    clear() {
        this.stack.clear();
        this.update();
    }
}