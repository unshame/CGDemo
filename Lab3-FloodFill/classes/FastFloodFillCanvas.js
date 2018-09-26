/* exported SlowFloodFillCanvas */
class SlowFloodFillCanvas extends AbstractFloodFillCanvas {

    *fillGenerator(p) {
        let stack = [];

        let curColor = this.fillColor;
        if (this.renderer.pixelHasColor(p, curColor)) {
            return;
        }
        let prevColor = this.renderer.getPixelColor(p);
        stack.push(p);

        while(stack.length != 0) {
            let pp = stack.pop();
            this.renderer.drawPixel(pp, [255, 0, 0, 255]);
            yield;
            this.renderer.drawPixel(pp, curColor);
            yield;

            for(let i = 0; i < this.dirs.length; i++) {
                let ppp = {
                    x: pp.x + this.dirs[i].x,
                    y: pp.y + this.dirs[i].y
                };

                if(this.renderer.pixelIsInside(ppp) && this.renderer.pixelHasColor(ppp, prevColor)) {
                    stack.push(ppp);
                }
            }
        }

        this.renderer.update();
    }

}
