/* exported setupSliders */
function setupSliders(renderer) {

    const minPos = -1500;
    const maxPos = 1500;

    return {

        x: setupSlider('#x', {
            value: renderer.translation[0],
            slide: (...args) => renderer.updatePosition(0, ...args),
            min: minPos,
            max: maxPos
        }),

        y: setupSlider('#y', {
            value: renderer.translation[1],
            slide: (...args) => renderer.updatePosition(1, ...args),
            min: minPos,
            max: maxPos
        }),

        z: setupSlider('#z', {
            value: renderer.translation[2],
            slide: (...args) => renderer.updatePosition(2, ...args),
            min: minPos,
            max: maxPos
        }),

        angleX: setupSlider('#angleX', {
            value: radToDeg(renderer.rotation[0]),
            slide: (...args) => renderer.updateAngle(0, ...args),
            min: -180,
            max: 180,
        }),

        angleY: setupSlider('#angleY', {
            value: radToDeg(renderer.rotation[1]),
            slide: (...args) => renderer.updateAngle(1, ...args),
            min: -180,
            max: 180,
        }),

        angleZ: setupSlider('#angleZ', {
            value: radToDeg(renderer.rotation[2]),
            slide: (...args) => renderer.updateAngle(2, ...args),
            min: -180,
            max: 180,
        }),

        scaleX: setupSlider('#scaleX', {
            value: renderer.scale[0],
            slide: (...args) => renderer.updateScale(0, ...args),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
        }),

        scaleY: setupSlider('#scaleY', {
            value: renderer.scale[1],
            slide: (...args) => renderer.updateScale(1, ...args),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
        }),

        scaleZ: setupSlider('#scaleZ', {
            value: renderer.scale[2],
            slide: (...args) => renderer.updateScale(2, ...args),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
        }),

        fov: setupSlider('#fov', {
            value: radToDeg(renderer.fieldOfView),
            slide: (...args) => renderer.updateFOV(...args),
            min: 30,
            max: 160,
            name: 'FOV'
        }),

        cameraX: setupSlider('#camX', {
            value: renderer.cameraTranslation[0],
            slide: (...args) => renderer.updateCameraPosition(0, ...args),
            min: minPos,
            max: maxPos,
            name: 'OffsetX'
        }),

        cameraY: setupSlider('#camY', {
            value: renderer.cameraTranslation[1],
            slide: (...args) => renderer.updateCameraPosition(1, ...args),
            min: minPos,
            max: renderer.gl.canvas.height,
            name: 'OffsetY'
        }),

        cameraZ: setupSlider('#camZ', {
            value: renderer.cameraTranslation[2],
            slide: (...args) => renderer.updateCameraPosition(2, ...args),
            min: minPos,
            max: maxPos,
            name: 'OffsetZ'
        }),

        cameraAngleX: setupSlider('#camAngleX', {
            value: radToDeg(renderer.cameraRotation[0]),
            slide: (...args) => renderer.updateCameraAngle(0, ...args),
            min: -180,
            max: 180,
            name: 'CircleX'
        }),

        cameraAngleY: setupSlider('#camAngleY', {
            value: radToDeg(renderer.cameraRotation[1]),
            slide: (...args) => renderer.updateCameraAngle(1, ...args),
            min: -180,
            max: 180,
            name: 'CircleY'
        }),

        targetX: setupSlider('#targetX', {
            value: renderer.targetTranslation[0],
            slide: (...args) => renderer.updateTargetPosition(0, ...args),
            min: minPos,
            max: maxPos,
            name: 'X'
        }),

        targetY: setupSlider('#targetY', {
            value: renderer.targetTranslation[1],
            slide: (...args) => renderer.updateTargetPosition(1, ...args),
            min: minPos,
            max: renderer.gl.canvas.height,
            name: 'Y'
        }),

        targetZ: setupSlider('#targetZ', {
            value: renderer.targetTranslation[2],
            slide: (...args) => renderer.updateTargetPosition(2, ...args),
            min: minPos,
            max: maxPos,
            name: 'Z'
        }),

        torusR: setupSlider('#torusR', {
            value: torusProps[0],
            slide: (e, value) => {
                torusProps[0] = value;
                updateGeometry();
            },
            min: 1,
            max: 500,
            name: 'Radius'
        }),

        torusSR: setupSlider('#torusSR', {
            value: torusProps[1],
            slide: (e, value) => {
                torusProps[1] = value;
                updateGeometry();
            },
            min: 1,
            max: 100,
            name: 'S Radius'
        }),

        torusStrips: setupSlider('#torusStrips', {
            value: torusProps[2],
            slide: (e, value) => {
                torusProps[2] = value;
                updateGeometry();
            },
            min: 2,
            max: 50,
            name: 'Strips'
        }),

        torusSections: setupSlider('#torusSections', {
            value: torusProps[3],
            slide: (e, value) => {
                torusProps[3] = value;
                updateGeometry();
            },
            min: 2,
            max: 30,
            name: 'Sections'
        }),

        cylinderRadius: setupSlider('#cylinderRadius', {
            value: cylinderProps[0],
            slide: (e, value) => {
                cylinderProps[0] = value;
                updateGeometry();
            },
            min: 1,
            max: 500,
            name: 'Radius'
        }),

        cylinderHeight: setupSlider('#cylinderHeight', {
            value: cylinderProps[1],
            slide: (e, value) => {
                cylinderProps[1] = value;
                updateGeometry();
            },
            min: 1,
            max: 1000,
            name: 'Height'
        }),

        cylinderSides: setupSlider('#cylinderSides', {
            value: cylinderProps[2],
            slide: (e, value) => {
                cylinderProps[2] = value;
                updateGeometry();
            },
            min: 2,
            max: 50,
            name: 'Sides'
        }),
    };
}