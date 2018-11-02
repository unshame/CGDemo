/* exported Renderer3D */
class Renderer3D {

    // Класс, выводящий растерезующий 3D изображение на переданный холст
    constructor(canvas, fpsCounterEl) {

        // Холст
        this.canvas = canvas;

        // Объект для вывода счетчика fps
        this.fpsCounterEl = fpsCounterEl;

        // WebGL контекст
        let gl = this.gl = canvas.getContext('webgl', {stencil: 8});

        // Компилируем шейдеры
        this.compileShaders();

        // Буферы для массивов вершин, нормалей и координат текстур
        this.buffers = {
            position: gl.createBuffer(),
            normal: gl.createBuffer(),
            texcoords: gl.createBuffer()
        };

        // Текстура
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // Устанавливаем дефолтные значения параметров, которые применяются автоматически
        this.resetProperties();

        // Дефолтные значения остальных параметров
        this.colorMode = this.gl.RGBA;
        this.textureEnabled = false;
        this.alphaValue = 150;
        this.alphaEnabled = false;

        this.lastUpdate = 0;

        this.lastFPSCount = 0;
        this.frameCount = 0;

        // Устанавливаем размер вьюпорта по размеру холста
        this.resizeViewportToDisplaySize();
    }

    // Компилирует программу с шейдерами
    compileShaders() {
        let gl = this.gl;

        // Программа с шейдерами
        let program = this.program = createProgramFromScripts(gl, [
            '3d-vertex-shader',
            '3d-fragment-shader'
        ]);


        // Говорим контексту использовать нашу программу
        gl.useProgram(this.program);

        // Позиции переменных в коде шейдера
        this.locations = {
            position: gl.getAttribLocation(program, 'a_position'),
            normal: gl.getAttribLocation(program, 'a_normal'),
            texcoords: gl.getAttribLocation(program, 'a_texcoord'),

            worldViewProjection: gl.getUniformLocation(program, 'u_worldViewProjection'),
            world: gl.getUniformLocation(program, 'u_world'),
            reverseLightDirection: gl.getUniformLocation(program, 'u_reverseLightDirection'),
            ambientLight: gl.getUniformLocation(program, 'u_ambient_light'),
        };
    }


    /* Сеттеры параметров */

    // Устанавливает дефолтные значения параметров, которые применяются автоматически
    resetProperties() {
        this.translation = [0, 120, 0];
        this.rotation = [degToRad(25), degToRad(0), 0];
        this.objectRotation = [0, 0, 0];
        this.objectRotationRate = [degToRad(0), degToRad(3), degToRad(1)];
        this.scale = [1, 1, 1];
        this.cameraTranslation = [0, 0, 1100];
        this.cameraUpVector = [0, 1, 0];
        this.targetTranslation = [0, 0, 0];
        this.cameraRotation = [0, 0];
        this.fieldOfView = degToRad(60);
        this.numObjects = 6;
        this.sceneRadius = 600;
        this.zNear = 1;
        this.zFar = 4000;
        this.lightDirection = [0.5, 0.7, 0.5];
        this.ambientLight = 0.5;
        this.stencilEnabled = false;
        this.primitiveType = this.gl.TRIANGLE_STRIP;
        this.fpsCounterEnabled = false;
        this.shouldDrawTargetObject = true;
        this.stencilOperator = this.gl.EQUAL;
    }

    // Загружает текстуру, применяет только при textureEnabled
    loadTexture(url) {
        let img = new Image();

        this.img = img;
        this.textureUrl = url;
        this.textureLoaded = false;

        img.onload = () => {

            if (this.img != img) {
                return;
            }

            this.textureLoaded = true;

            if (this.textureEnabled) {
                this.applyTexture(img);
            }
        };

        img.src = url;
        img.setAttribute('crossOrigin', '');
    }

    applyTexture(img) {
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.colorMode, this.colorMode,
            gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    // Меняет текстуру на статический цвет
    resetTexture() {
        let gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, this.colorMode, 1, 1, 0, this.colorMode,
            gl.UNSIGNED_BYTE, new Uint8Array(this.color));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    // Включает/выключает отображение текстуры
    setTextureMode(textureEnabled) {
        this.textureEnabled = textureEnabled;

        if(textureEnabled) {

            if (this.textureLoaded) {
                this.applyTexture(this.img);
            }
            else {
                this.loadTexture(this.textureUrl);
            }
        }
        else {
            this.resetTexture();
        }
    }

    // Устанавливает массив вершин
    setGeometry(geometry) {
        this.geometry = geometry;
        this._bufferArray(this.buffers.position, new Float32Array(geometry));
    }

    // Устанавливает цвет, применяет если не textureEnabled
    setColor(color) {
        this.color = [...color, this.alphaEnabled ? this.alphaValue : 255];

        if(!this.textureEnabled) {
            this.resetTexture();
        }
    }

    // Устанавливает массив нормалей
    setNormals(normals) {
        this.normals = normals;
        this._bufferArray(this.buffers.normal, new Float32Array(normals));
    }

    // Устанавливает массив координат текстур
    setTexcoords(texcoords) {
        this.texcoords = texcoords;
        this._bufferArray(this.buffers.texcoords, new Float32Array(texcoords));
    }

    // Устанавливает значение альфа канала
    setAlpha(alphaEnabled, value) {
        this.alphaEnabled = alphaEnabled;

        if (value !== undefined) {
            this.alphaValue = value;
        }

        this.setColor(this.color.slice(0, 3));
    }


    /* Рендеринг */

    // Очищает вьюпорт
    clearViewport() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    // Включает необходимые возможности рендерера
    enableCapabilities() {
        let gl = this.gl;

        if (this.alphaEnabled) {
            // Включает бленд прозрачных пикселей
            gl.enable(gl.BLEND);
            // Функция бленда для прозрачности
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
        else {
            gl.enable(gl.DEPTH_TEST);
        }

        // Мы не будем рисовать задние стороны поверхностей
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    }

    // Выключает включенные возможности рендерера
    disableCapabilities() {
        let gl = this.gl;
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
    }

    // Устанавливает размер вьюпорта по размеру холста
    resizeViewportToDisplaySize() {
        let canvas = this.gl.canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    }

    // Выводит изображение во вьюпорт
    drawScene(now) {

        let gl = this.gl;

        // Дельта времени
        let dt = now - this.lastUpdate;

        // Считаем FPS
        this._countFPS(now, dt);

        // Вращаем объекты сцены в соотвтветствии с прошедшим временем
        this._updateObjectRotation(dt);

        // Очищаем вьюпорт, включаем необходимые возможности рендерера
        this.clearViewport();
        this.enableCapabilities();

        let locations = this.locations;
        let buffers = this.buffers;

        // Помещаем буфер вершин в память видеокарты
        this._setVertexAttrib(locations.position, buffers.position,
            3,             // Кол-во компонент в одной вершине
            gl.FLOAT,      // Тип данных
            false,         // Нужно ли нормализовывать значения (переводить из 0-255 в 0-1)
            0,             // stride
            0              // offset
        );

        // Буфер нормалей
        this._setVertexAttrib(locations.normal, buffers.normal, 3, gl.FLOAT, false, 0, 0);

        // Буфер координат текстуры
        this._setVertexAttrib(locations.texcoords, buffers.texcoords, 2, gl.FLOAT, false, 0, 0);

        // Яркость освещения окружения
        gl.uniform1f(locations.ambientLight, this.ambientLight);

        // Вектор направление света
        gl.uniform3fv(locations.reverseLightDirection, V3Math.normalize(this.lightDirection));

        // Высчитываем свдиг, поворот и мастаб сцены, точки наблюдения, освещения и центрального объекта
        let projectionMatrix = this._getProjectionMatrix();  // Матрица проекции с перспективой
        let viewMatrix = this._getViewMatrix();              // Матрица точки наблюдения
        let worldMatrix = this._getWorldMatrix();            // Матрица сцены
        let targetMatrix = this._getTargetMatrix();          // Матрица центрального объекта

        // Матрица точки наблюдения с учетом перспективы
        let viewProjectionMatrix = M4Math.multiply(projectionMatrix, viewMatrix);

        // Матрица центрального объекта с учетом точки наблюдения
        let targetViewProjectionMatrix = M4Math.multiply(viewProjectionMatrix, targetMatrix);

        // Выводим геометрию по полученным матрицам
        if(this.stencilEnabled && this.shouldDrawTargetObject) {
            this._drawAllGeometryWithStencil(worldMatrix, viewProjectionMatrix, targetViewProjectionMatrix);
        }
        else {
            this._drawAllGeometry(worldMatrix, viewProjectionMatrix, targetViewProjectionMatrix);
        }

        // Ресетим атрибуты буферов
        this._resetVertexAttrib(locations.position);
        this._resetVertexAttrib(locations.normal);
        this._resetVertexAttrib(locations.texcoords);

        // Отключаем включенные возможности рендерера
        this.disableCapabilities();

        // Запоминаем текущее время для вычисления дельты времени
        this.lastUpdate = now;

        // Ставим новый запуск функции в конец очереди рендерера браузера
        requestAnimationFrame((now) => this.drawScene(now));
    }


    /* Анимация */

    // Вращает объекты сцены в соотвтветствии с прошедшим временем
    _updateObjectRotation(dt) {
        for (let i = 0; i < this.objectRotationRate.length; i++) {
            this.objectRotation[i] += this.objectRotationRate[i] * dt * 0.1;
        }
    }

    // Считает и выводит FPS
    _countFPS(now, dt) {
        this.frameCount++;

        if (now - this.lastFPSCount >= 1000) {

            if(this.fpsCounterEnabled) {
                this.fpsCounterEl.innerHTML = this.frameCount;

                let color = 'green';
                if (this.frameCount < 30) {
                    color = 'red';
                }
                else if(this.frameCount < 50) {
                    color = 'yellow';
                }

                this.fpsCounterEl.style.setProperty('color', color);
            }
            else {
                this.fpsCounterEl.innerHTML = '';
            }

            this.frameCount = 0;
            this.lastFPSCount = now;
        }
    }


    /* Заполнение памяти видеокарты */

    // Помещает массив в память видеокарты
    _bufferArray(buffer, array, usage = this.gl.STATIC_DRAW) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, array, usage);
    }

    // Помещает массив вершин в память карты
    _setVertexAttrib(location, buffer, size, type, normalize, stride, offset) {
        let gl = this.gl;
        // Включаем атрибут
        gl.enableVertexAttribArray(location);
        // gl.ARRAY_BUFFER = buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        // Говорим WebGL как интерпретировать атрибут
        gl.vertexAttribPointer(location, size, type, normalize, stride, offset);
    }

    // Ресетит атрибут буфера массива
    _resetVertexAttrib(location) {
        this.gl.disableVertexAttribArray(location);
    }


    /* Вывод объектов */

    // Выводит центральный объект и сцену
    _drawAllGeometry(worldMatrix, viewProjectionMatrix, targetViewProjectionMatrix) {
        let locations = this.locations;

        // Выводим центральный объект
        if (this.shouldDrawTargetObject) {
            this._drawGeometryAt(locations.world, M4Math.translation(0, 0, 0),
                locations.worldViewProjection, targetViewProjectionMatrix);
        }

        // Выводим объекты сцены на окружности
        for (let i = 0; i < this.numObjects; ++i) {
            this._drawGeometryOnCircle(i, locations.world, worldMatrix,
                locations.worldViewProjection, viewProjectionMatrix);
        }
    }

    // Выводит центральный объект и сцену с применением трафаретного буфера
    _drawAllGeometryWithStencil(worldMatrix, viewProjectionMatrix, targetViewProjectionMatrix) {
        let gl = this.gl;
        let locations = this.locations;

        // Включаем трафаретный буфер
        gl.enable(gl.STENCIL_TEST);

        // Ставим его в режим задания маски
        gl.stencilFunc(gl.ALWAYS, 1, 0xff);
        gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);

        // Временно ставим 100% прозрачность, чтобы маска корректно работала
        let alpha = this.alphaValue;
        let alphaEnabled = this.alphaEnabled;
        this.setAlpha(true, 0);

        // Включаем возможности с учетом включенной прозрачности
        if (!alphaEnabled) {
            this.disableCapabilities();
            this.enableCapabilities();
        }

        // Выключаем режим текстуры для центрального объекта
        let textureEnabled = this.textureEnabled;
        if(textureEnabled) {
            this.setTextureMode(false);
        }

        // Выводим центральный объект/маску
        this._drawGeometryAt(locations.world, M4Math.translation(0, 0, 0),
            locations.worldViewProjection, targetViewProjectionMatrix);

        // Возвращаем значение прозрачности
        this.setAlpha(alphaEnabled, alpha);

        // Восстанавливаем включенные возможности с учетом выключенной прозрачности
        if (!alphaEnabled) {
            this.disableCapabilities();
            this.enableCapabilities();
        }

        // Восстанавливаем режим текстур
        if (textureEnabled) {
            this.setTextureMode(true);
        }

        // Переключаем трафаретный буфер в режим наложения маски
        gl.stencilFunc(this.stencilOperator, 1, 0xff);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        // Выводим объекты сцены на окружности
        for (let i = 0; i < this.numObjects; ++i) {
            this._drawGeometryOnCircle(i, locations.world, worldMatrix,
                locations.worldViewProjection, viewProjectionMatrix);
        }

        // Выключаем трафаретный режим
        gl.disable(gl.STENCIL_TEST);
    }

    // Выводит объект на окружности
    _drawGeometryOnCircle(i, worldMatrixLocation, worldMatrix, worldViewProjectionMatrixLocation, viewProjectionMatrix) {
        let angle = i * Math.PI * 2 / this.numObjects;
        let x = Math.cos(angle) * this.sceneRadius;
        let y = Math.sin(angle) * this.sceneRadius;

        // Матрицу объекта с учетом сдвига, поворота и мастабирования
        let curWorldMatrix = M4Math.translate(worldMatrix, x, 0, y);
        curWorldMatrix = M4Math.yRotate(curWorldMatrix, -angle);
        curWorldMatrix = M4Math.xRotate(curWorldMatrix, this.objectRotation[0]);
        curWorldMatrix = M4Math.yRotate(curWorldMatrix, this.objectRotation[1]);
        curWorldMatrix = M4Math.zRotate(curWorldMatrix, this.objectRotation[2]);
        curWorldMatrix = M4Math.scale(curWorldMatrix, ...this.scale);

        // Матрица объекта с учетом точки наблюдения
        let curWorldViewProjection = M4Math.multiply(viewProjectionMatrix, curWorldMatrix);

        // Выводим объект
        this._drawGeometryAt(worldMatrixLocation, curWorldMatrix, worldViewProjectionMatrixLocation, curWorldViewProjection);
    }

    // Выводит объект в соответствии с worldViewProjectionMatrix
    // Применяет освещение в соотвтветствии с worldMatrix
    _drawGeometryAt(worldMatrixLocation, worldMatrix, worldViewProjectionMatrixLocation, worldViewProjectionMatrix) {

        // Перемещаем матрицы в память видеокарты
        this.gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);
        this.gl.uniformMatrix4fv(worldViewProjectionMatrixLocation, false, worldViewProjectionMatrix);

        // Запускаем функции шейдеров для вывода объекта
        this.gl.drawArrays(this.primitiveType, 0, this.geometry.length / 3);
    }


    /* Базовые матрицы */

    // Возвращает матрицу перспективы
    _getProjectionMatrix() {
        let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        return M4Math.perspective(this.fieldOfView, aspect, this.zNear, this.zFar);
    }

    // Возвращает матрицу точки наблюдения
    _getViewMatrix() {
        // Рассчитываем позицию камеры на круге
        let cameraMatrix = M4Math.xRotation(this.cameraRotation[0]);
        cameraMatrix = M4Math.yRotate(cameraMatrix, this.cameraRotation[1]);
        cameraMatrix = M4Math.translate(cameraMatrix, ...this.cameraTranslation);

        // Позиция из полученной матрицы
        let cameraPosition = [
            cameraMatrix[12],
            cameraMatrix[13],
            cameraMatrix[14],
        ];

        // Рассчитываем матрицу камеры с учетом позиции цели наблюдения
        cameraMatrix = M4Math.lookAt(cameraPosition, this.targetTranslation, this.cameraUpVector);

        // Инверсируем матрицу, чтобы получить матрицу точки наблюдения
        return M4Math.inverse(cameraMatrix);
    }

    // Возвращает матрицу сцены
    _getWorldMatrix() {
        let matrix = M4Math.translation(...this.translation);
        matrix = M4Math.xRotate(matrix, this.rotation[0]);
        matrix = M4Math.yRotate(matrix, this.rotation[1]);
        matrix = M4Math.zRotate(matrix, this.rotation[2]);
        return matrix;
    }

    // Возвращает матрицу центрального объекта
    _getTargetMatrix() {
        let targetMatrix = M4Math.translation(...this.targetTranslation);
        targetMatrix = M4Math.scale(targetMatrix, ...this.scale);
        return targetMatrix;
    }
}
