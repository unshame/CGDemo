/* exported RenderStack */
class RenderStack {

    constructor() {
        this.stack = [];
    }

    push(shape) {
        this.stack.push(shape);
    }

    pop() {
        this.stack.pop();
    }

    remove(shape) {
        let index = this.stack.indexOf(shape);

        if (index != -1) {
            this.stack.splice(index, 1);
        }
        else {
            console.warn(`Trying to remove shape that's not on the render stack`, shape, this);
        }
    }

    clear() {
        this.stack.length = 0;
    }

}