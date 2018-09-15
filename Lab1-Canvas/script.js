let screen = document.getElementById('screen');
let page1 = document.getElementById('page1');
let page2 = document.getElementById('page2');
let canvas = screen;


/* ОЦПИИ */

let canvasWidth = canvas.width = page1.width = page2.width = 600;
let canvasHeight = canvas.height = page1.height = page2.height = 400;
let p2 = { x: 15, y: 80 };
let p3 = { x: 120, y: 120 };
let color1 = [255, 0, 255, 255];
let color2 = [0, 255, 0, 255];
let color3 = [0, 0, 200, 255];
let angle = 13;


/* ИНИЦИАЛИЗАЦИЯ */

// Инициализация "холста"
let ctx, canvasData;
setCanvasVariables();
let canvasBoxWidth = canvasWidth + 2;
let canvasBoxHeight = canvasHeight + 2;
canvas.style.width = canvasBoxWidth + 'px';
canvas.style.height = canvasBoxHeight  + 'px';
page1.style.width = canvasBoxWidth / 2 + 'px';
page1.style.height = canvasBoxHeight / 2 + 'px';
page2.style.width = canvasBoxWidth / 2 + 'px';
page2.style.height = canvasBoxHeight / 2 + 'px';
document.querySelectorAll('fieldset').forEach((el) => {
    el.style.width = canvasBoxWidth + 'px';
});

// Инициализация "стирателя"
let eraserType = getEraserType();
document.querySelectorAll('input[name="eraser"]').forEach((el) => {
    el.addEventListener('change', () => eraserType = getEraserType());
});

// Инициализация интервала
let interval = getInterval();
document.getElementById('interval').addEventListener('change', () => interval = getInterval());
document.getElementById('interval').addEventListener('keyup', () => interval = getInterval());

// Инициализация треугольника в центре экрана
let hw = canvasWidth / 2;
let hh = canvasHeight / 2;
let boundaries = getTriangleBoxBoundaries({ x: 0, y: 0 }, p2, p3);
let triangleWidth = boundaries[1].x - boundaries[0].x;
let triangleHeight = boundaries[1].y - boundaries[0].y;
let offset = { x: hw - triangleWidth / 2, y: hh - triangleHeight / 2 };
moveTriangle(offset, p2, p3, angle);


/* ФУНКЦИИ */

// Интервал/таймаут

function getInterval() {
    let interval = document.getElementById('interval').value;
    console.log(interval);
    return interval;
}

// Таймаут дает браузеру время на вывод изображения на экран
function timeout() {
    let t = Date.now();
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            resolve(Date.now() - t);
        }, interval);
    });
}



/* Работа с "холстом" */

function setCanvasVariables() {
    ctx = canvas.getContext('2d');
    canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
}

function updateCanvas() {
    ctx.putImageData(canvasData, 0, 0);
}

function swapCanvas() {
    if (canvas === page1) {
        canvas = page2;
    }
    else {
        canvas = page1;
    }
    setCanvasVariables();
}

/* Способ стирания */

function getEraserType() {
    let eraserType = document.querySelector('input[name="eraser"]:checked').value;
    console.log(eraserType);
    return eraserType;
}

// Стирание
function applyEraser(p1, p2, p3) {

    switch (eraserType) {

        case 'swapClear':
            screen.getContext('2d').drawImage(canvas, 0, 0);
            swapCanvas();

        case 'boxClear':
            let boundaries = getTriangleBoxBoundaries(p1, p2, p3);
            clearRect(boundaries[0], boundaries[1]);
            break;

        case 'fullClear':
            clearScreen();
            break;
    }

    if (canvas !== screen && eraserType !== 'swapClear') {
        console.log('reset')
        canvas = screen;
        setCanvasVariables();
    }
}

/* Рисование пикселей */

function drawPixel(p, color) {
    let index = (p.x + p.y * canvasWidth) * 4;

    canvasData.data[index] = color[0];
    canvasData.data[index + 1] = color[1];
    canvasData.data[index + 2] = color[2];
    canvasData.data[index + 3] = color[3];
}

function drawColoredPixel(p) {
    if (canvas === screen) {
        drawPixel(p, color1);
    }
    else if(canvas === page1) {
        drawPixel(p, color2);
    }
    else if(canvas === page2) {
        drawPixel(p, color3);
    }
}

function drawClearPixel(p) {
    drawPixel(p, [255, 255, 255, 255]);
}

function clearScreen() {
    for(let i = 0; i < canvasData.data.length; i++) {
        canvasData.data[i] = 255;
    }
}

function clearRect(p1, p2) {
    for (let x = p1.x; x <= p2.x; x++) {
        for (let y = p1.y; y <= p2.y; y++) {
            drawClearPixel({x, y});
        }
    }
}


/* Функции линии по алгоритму Брезенхэма */

// Синхронная функция для рисования линий
function plotLine(p1, p2, func) {
    let i = _plotLineCalcInput(p1, p2);
    let p = { x: p1.x, y: p1.y };

    while (func(p) !== false) {

        i.err = _plotLineIncrement(p, p2, i.dx, i.dy, i.sx, i.sy, i.err);

        if(i.err === false) {
            break;
        }
    }
}

// Асинхронная функция для движение треугольника
async function plotLineAsync(p1, p2, func) {
    let i = _plotLineCalcInput(p1, p2);
    let p = { x: p1.x, y: p1.y };

    while ((await func(p)) !== false) {
        i.err = _plotLineIncrement(p, p2, i.dx, i.dy, i.sx, i.sy, i.err);

        if (i.err === false) {
            break;
        }
    }
}

// Вычисление необходимых данных для алгоритма
function _plotLineCalcInput(p1, p2) {
    let dx = Math.abs(p2.x - p1.x);
    let dy = Math.abs(p2.y - p1.y);
    let sx = (p1.x < p2.x) ? 1 : -1;
    let sy = (p1.y < p2.y) ? 1 : -1;
    let err = dx - dy;

    return { dx, dy, sx, sy, err};
}

// Выбор следующих пикселей и подсчет ошибки по алгоритму
function _plotLineIncrement(p1, p2, dx, dy, sx, sy, err) {
    if (p1.x == p2.x && p1.y == p2.y) {
        return false;
    }

    let e2 = 2 * err;

    if (e2 > -dy) {
        err -= dy;
        p1.x += sx;
    }

    if (e2 < dx) {
        err += dx;
        p1.y += sy;
    }

    return err;
}

/* Рисование треугольника */

// Рисует линию пикселями
function drawLine(p1, p2) {
    plotLine(p1, p2, drawColoredPixel);
}

// Рисует треугольник линиями из пикселев
function drawTriangle(p1, p2, p3) {
    drawLine(p1, p2);
    drawLine(p2, p3);
    drawLine(p3, p1);
}

// Возвращает два угла прямоугольника, в которые помещается треугольник
function getTriangleBoxBoundaries(p1, p2, p3) {
    let left = Math.min(p1.x, p2.x, p3.x);
    let right = Math.max(p1.x, p2.x, p3.x);
    let top = Math.min(p1.y, p2.y, p3.y);
    let bottom = Math.max(p1.y, p2.y, p3.y);
    return [{ x: left, y: top }, { x: right, y: bottom} ];
}

// Проверяет, произошло ли столкновение треугольника с краями экрана
function getTriangleScreenCollision(p1, p2, p3) {
    let left = Math.min(p1.x, p2.x, p3.x) <= 0;
    let right = Math.max(p1.x, p2.x, p3.x) >= canvasWidth;
    let top = Math.min(p1.y, p2.y, p3.y) <= 0;
    let bottom = Math.max(p1.y, p2.y, p3.y) >= canvasHeight;
    return { top, right, bottom, left, collided: top || right || bottom || left};
}

// Проверяет, произошла ли коллизия в том же направлении, в котором движется объект
function collisionInRightDirection(collision, direction) {
    return (
        direction.x === 1 && collision.right ||
        direction.x === -1 && collision.left ||
        direction.y === 1 && collision.bottom ||
        direction.y === -1 && collision.top
    );
}

// Возвращает направление линии (-1, 0, 1)
function getLineDirection(p1, p2) {
    return {
        x: Math.min(Math.max(Math.round(p2.x - p1.x), -1), 1), 
        y: Math.min(Math.max(Math.round(p2.y - p1.y), -1), 1)
    }
}


/* Движение треугольника */

async function moveTriangle(origin, p2, p3, degrees) {
    let length = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
    let mp1 = { x: 0, y: 0 };

    // Нормализируем угол и направление линии движения
    if(Math.abs(degrees) > 90) {
        let s = degrees > 0 ? 1 : -1;
        degrees = s * (90 - (Math.abs(degrees) - 90));
        length = -length;
    }

    // Вращаем вектор движения треугольника
    let mp2 = rotateVector(mp1, { x: length, y: 0 }, degrees);

    // Параметры изменения размеров треугольника
    let max = 2, min = 1, cur = 1, dir = 1, step = 0.005;
    let initP2 = Object.assign({}, p2);
    let initP3 = Object.assign({}, p3);

    // Информация о коллизии
    let collision;

    // Двигаем треугольник бесконечно
    while(true) {

        // Движение по текущей линии
        await plotLineAsync(mp1, mp2, async (p) => {

            // Обновляем позицию треугольника и проверяем коллизию
            collision = _updateTrianglePosition(
                { x: origin.x, y: origin.y },
                { x: origin.x + p2.x, y: origin.y + p2.y},
                { x: origin.x + p3.x, y: origin.y + p3.y},
                mp1, mp2, p
            );

            // Обновляем направление после коллизии
            if(collision) {
                mp1 = p;
                mp2 = _getVectorAfterCollision(mp1, mp2, p, degrees, collision);
                return false;
            }

            // Меняем размер треугольника
            ({cur, dir} = _resizeTriangle(p2, p3, initP2, initP3, min, max, cur, dir, step));

            // Даем браузеру шанс нарисовать треугольник
            await timeout();

        });
    }
}

// Меняет позицию вершин треугольника для изменения его размера
function _resizeTriangle(p2, p3, initP2, initP3, min, max, cur, dir, step) {
    if (dir === 1) {
        cur += step;
        if (cur >= max) {
            cur = max;
            dir = -1;
        }
    }
    else {
        cur -= step;
        if (cur <= min) {
            cur = min;
            dir = 1;
        }
    }

    p2.x = Math.round(initP2.x * cur);
    p2.y = Math.round(initP2.y * cur);
    p3.x = Math.round(initP3.x * cur);
    p3.y = Math.round(initP3.y * cur);

    return { cur, dir };
}

// Проверяет коллизию и рисует треугольник в новой позиции
function _updateTrianglePosition(p1, p2, p3, mp1, mp2, p) {
    let np1 = { x: p1.x + p.x, y: p1.y + p.y };
    let np2 = { x: p2.x + p.x, y: p2.y + p.y };
    let np3 = { x: p3.x + p.x, y: p3.y + p.y };
    let collision = getTriangleScreenCollision(np1, np2, np3);

    if (collision.collided) {
        let direction = getLineDirection(mp1, mp2);
        if (collisionInRightDirection(collision, direction)) {
            return collision;
        }
    }

    applyEraser(np1, np2, np3);
    drawTriangle(np1, np2, np3);
    updateCanvas();
    return false;
}

// Возвращает вектор движения треугольника после коллизии
function _getVectorAfterCollision(mp1, mp2, p, degrees, collision) {
    let direction = getLineDirection(mp1, mp2);
    let length = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
    let s;

    console.log(collision);

    if(collision.top && collision.bottom || collision.left && collision.right) {
        if (isNaN(s)) {
            throw new Error('Invalid collision ' + JSON.stringify(collision));
        }
    }

    if (collision.top) {
        if (collision.right) {
            degrees = -45;
            s = -1;
        }
        else if (collision.left) {
            degrees = 45;
            s = 1;
        }
        else if (direction.x === 1) {
            degrees = Math.abs(degrees);
            s = 1;
        }
        else {
            degrees = -Math.abs(degrees);
            s = -1;
        }
    }
    else if (collision.right) {
        if(collision.bottom) {
            degrees = 45;
            s = -1;
        }
        else if (collision.left) {
            degrees = -45;
            s = 1;
        }
        else if (direction.y === 1) {
            degrees = -Math.abs(degrees);
            s = -1;

        }
        else {
            degrees = Math.abs(degrees);
            s = -1;
        }
    }
    else if(collision.bottom) {
        if(direction.x === 1) {
            degrees = -Math.abs(degrees);
            s = 1;
        }
        else {
            degrees = Math.abs(degrees);
            s = -1;
        }
    }
    else if (collision.left) {
        if (direction.y === 1) {
            degrees = Math.abs(degrees);
            s = 1;
        }
        else {
            degrees = -Math.abs(degrees);
            s = 1;
        }
    }

    return rotateVector(p, { x: p.x + length * s, y: p.y }, degrees);
}

/* Функции вращения */

function rotateVector(p1, p2, degrees) {
    return rotateVectorRad(p1, p2, degrees * Math.PI / 180);
}

function rotateVectorRad(p1, p2, radians) {

    let p = { x: p2.x - p1.x, y: p2.y - p1.y};
    let ca = Math.cos(radians);
    let sa = Math.sin(radians);
    let x = Math.round(ca * p.x - sa * p.y);
    let y = Math.round(sa * p.x + ca * p.y);
    return {
        x: x + p1.x,
        y: y + p1.y
    };
}
