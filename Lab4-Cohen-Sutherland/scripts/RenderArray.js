/* exported RenderArray */
class RenderArray {

    /**
    * Массив для хранения фигур для рисования.
    * @class
    */
    constructor() {

        /**
        * Массив с фигурами.
        * @type {Array}
        */
        this.array = [];
    }

    /**
    * Добавляет фигуру в массив.
    * @param {object} shape фигура
    */
    add(shape) {
        this.array.push(shape);
    }

    /**
    * Убирает фигуру из массива.
    * @param {object} shape фигура
    */
    remove(shape) {
        let index = this.array.indexOf(shape);

        if (index != -1) {
            this.array.splice(index, 1);
        }
        else {
            console.warn(`Trying to remove shape that's not on the render array`, shape, this);
        }
    }

    /** Очищает массив. */
    clear() {
        this.array.length = 0;
    }

}