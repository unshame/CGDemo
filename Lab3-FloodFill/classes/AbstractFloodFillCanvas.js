/* exported AbstractFloodFillCanvas */
class AbstractFloodFillCanvas {

    constructor(canvas, width, height, color, fillColor, numRects, maxRectWidth) {

        this.dirs = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];

        this.fillColor = fillColor;
        this.numRects = numRects;
        this.maxRectWidth = maxRectWidth;

        this.intervals = [];

        /**
        * Объект, рисующий пиксели на холсте.
        * @type {Renderer}
        */
        this.renderer = new Renderer(canvas, width, height, color);

        let ctx = this.renderer.ctx;
        ctx.globalAlpha = 1;

    }

    reset() {
        this.clearIntervals();
        this.renderer.clearCanvas();
        this.renderer.update();
        this.randomlyFillCanvas();
    }

    clearIntervals() {
        for (let int of this.intervals) {
            clearInterval(int);
        }
        this.intervals.length = 0;
    }

    randomlyFillCanvas() {

        let numRects = this.numRects;
        let w = this.renderer.width;
        let h = this.renderer.height;
        let maxRectWidth = this.maxRectWidth;
        let numVerts = 4;
        let ctx = this.renderer.ctx;

        ctx.beginPath();
        for (let i = 0; i < numRects; i++) {

            let x = Math.floor(Math.random() * w);
            let y = Math.floor(Math.random() * h);

            ctx.moveTo(x, y);

            for (let k = 1; k < numVerts; k++) {

                let dx = Math.floor(Math.random() * maxRectWidth) - maxRectWidth / 2;
                let dy = Math.floor(Math.random() * maxRectWidth) - maxRectWidth / 2;

                x += dx;
                y += dy;

                ctx.lineTo(x, y);
            }
            ctx.closePath();
        }
        ctx.fill();

        this.renderer.restore();
        this.renderer.removeAntiAliasing();
        this.renderer.update();
    }

    fill(p) {
        let filler = this.fillGenerator(p);
        while (!filler.next().done){};
    }

    fillStep(p, interval = 0) {
        let filler = this.fillGenerator(p);
        let int = setInterval(() => {

            if (filler.next().done) {
                clearInterval(int);
                this.intervals.splice(this.intervals.indexOf(int), 1);
            }

            this.renderer.update();
        }, interval);

        this.intervals.push(int);
    }

    *fillGenerator() {
        throw Error('Not implemented');
    }
}