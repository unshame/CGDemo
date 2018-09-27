/* exported FastFloodFillCanvas */

/**
* Класс интерфейса быстрой заливки холста.
* @extends AbstractFloodFillCanvas
*/
class FastFloodFillCanvas extends AbstractFloodFillCanvas {

    /**
    * Заливает холст быстрым алгоритмом.
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

        // Закрашиваем и добавляем затравочный пиксель в стек
        let prevColor = this.renderer.getPixelColor(p);
        this.renderer.drawPixel(p, curColor);
        stack.push(p);
        numPushes++;
        maxDepth = 1;

        // Пока стек не пуст
        while(stack.length != 0) {

            // Снимает пиксель со стека
            let pp = stack.pop();

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

                // закрашиваем их
                yield this.renderer.drawPixel(ppp, [255, 0, 0, 255]);
                yield this.renderer.drawPixel(ppp, curColor);

                // и добавляем в стек
                stack.push(ppp);

                numPushes++;

                if (stack.length > maxDepth) {
                    maxDepth = stack.length;
                }
            }
        }

        console.log(`Fast algorithm: ${numPushes} stack pushes, ${numRepeats} already colored pixels checked, ${maxDepth} max stack depth.`);
        this.renderer.update();
    }

}
