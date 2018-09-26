/* exported SlowFloodFillCanvas */
class SlowFloodFillCanvas extends AbstractFloodFillCanvas {

    *fillGenerator(p) {
        let stack = [];
        let numPushes = 0;
        let numRepeats = 0;
        let maxDepth = 0;
        let curColor = this.fillColor;

        if (this.renderer.pixelHasColor(p, curColor)) {
            return;
        }

        let prevColor = this.renderer.getPixelColor(p);
        stack.push(p);

        while(stack.length != 0) {
            let pp = stack.pop();
            yield this.renderer.drawPixel(pp, [255, 0, 0, 255]);
            yield this.renderer.drawPixel(pp, curColor);

            for(let i = 0; i < this.dirs.length; i++) {

                let ppp = {
                    x: pp.x + this.dirs[i].x,
                    y: pp.y + this.dirs[i].y
                };

                if(!this.renderer.pixelIsInside(ppp)) {
                    continue;
                }

                if (!this.renderer.pixelHasColor(ppp, prevColor)) {
                    numRepeats++;
                    continue;
                }

                stack.push(ppp);

                numPushes++;

                if(stack.length > maxDepth) {
                    maxDepth = stack.length;
                }
            }
        }

        console.log(`Slow algorithm: ${numPushes} stack pushes, ${numRepeats} already colored pixels checked, ${maxDepth} max stack depth.`);

        this.renderer.update();
    }

}
