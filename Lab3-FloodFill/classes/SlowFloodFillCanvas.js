/* exported SlowFloodFillCanvas */

/**
* Класс интерфейса медленной заливки холста.
* @extends AbstractFloodFillCanvas
*/
class SlowFloodFillCanvas extends AbstractFloodFillCanvas {

    /**
    * Заливает холст медленным алгоритмом.
    * Генерирует остановку после каждого залитого пикселя.
    * @param {point} p точка начала заливки
    */
    *fillGenerator(p) {
        let stack = [];
        let numPushes = 0;
        let numRepeats = 0;
        let maxDepth = 0;
        let curColor = this.fillColor;

        // Проверяем что затравочный пиксель уже не закрашен
        if (this.renderer.pixelHasColor(p, curColor)) {
            return;
        }

        // Добавляем затравочный пиксель в стек
        let prevColor = this.renderer.getPixelColor(p);
        stack.push(p);

        // Пока стек не пуст
        while(stack.length != 0) {

            // Снимает пиксель со стека
            let pp = stack.pop();

            // И закрашиваем его
            yield this.renderer.drawPixel(pp, [255, 0, 0, 255]);
            yield this.renderer.drawPixel(pp, curColor);

            // Все пиксели рядом
            for(let i = 0; i < this.dirs.length; i++) {

                let ppp = {
                    x: pp.x + this.dirs[i].x,
                    y: pp.y + this.dirs[i].y
                };

                // которые находятся внутри холста
                if(!this.renderer.pixelIsInside(ppp)) {
                    continue;
                }

                // и еще не закрашены
                if (!this.renderer.pixelHasColor(ppp, prevColor)) {
                    numRepeats++;
                    continue;
                }

                // добавляем в стек
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
