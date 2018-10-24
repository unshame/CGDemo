/* exported setupSliders */
function setupSliders(renderer) {

    const minPos = -1500;
    const maxPos = 1500;

    return {

        x: setupSlider('#x', {
            value: renderer.translation[0],
            slide: (event, value) => renderer.translation[0] = value,
            min: minPos,
            max: maxPos,
            scrollStep: 10
        }),

        y: setupSlider('#y', {
            value: renderer.translation[1],
            slide: (event, value) => renderer.translation[1] = value,
            min: minPos,
            max: maxPos,
            scrollStep: 10
        }),

        z: setupSlider('#z', {
            value: renderer.translation[2],
            slide: (event, value) => renderer.translation[2] = value,
            min: minPos,
            max: maxPos,
            scrollStep: 10
        }),

        angleX: setupSlider('#angleX', {
            value: radToDeg(renderer.rotation[0]),
            slide: (event, value) => renderer.rotation[0] = degToRad(value),
            min: -180,
            max: 180,
        }),

        angleY: setupSlider('#angleY', {
            value: radToDeg(renderer.rotation[1]),
            slide: (event, value) => renderer.rotation[1] = degToRad(value),
            min: -180,
            max: 180,
        }),

        angleZ: setupSlider('#angleZ', {
            value: radToDeg(renderer.rotation[2]),
            slide: (event, value) => renderer.rotation[2] = degToRad(value),
            min: -180,
            max: 180,
        }),

        amount: setupSlider('#amount', {
            value: renderer.numObjects,
            slide: (event, value) => renderer.numObjects = value,
            min: 1,
            max: 50,
        }),

        spacing: setupSlider('#spacing', {
            value: renderer.sceneRadius,
            slide: (event, value) => renderer.sceneRadius = value,
            min: 0,
            max: 900,
        }),

        scale: setupSlider('#scale', {
            value: renderer.scale[0],
            slide: (event, value) => renderer.scale.fill(value),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
        }),

        rotationX: setupSlider('#rotationX', {
            value: radToDeg(renderer.objectRotationRate[0]),
            slide: (event, value) => renderer.objectRotationRate[0] = degToRad(value),
            min: -9,
            max: 9,
            scrollStep: 1
        }),

        rotationY: setupSlider('#rotationY', {
            value: radToDeg(renderer.objectRotationRate[1]),
            slide: (event, value) => renderer.objectRotationRate[1] = degToRad(value),
            min: -9,
            max: 9,
            scrollStep: 1
        }),

        rotationZ: setupSlider('#rotationZ', {
            value: radToDeg(renderer.objectRotationRate[2]),
            slide: (event, value) => renderer.objectRotationRate[2] = degToRad(value),
            min: -9,
            max: 9,
            scrollStep: 1
        }),

        fov: setupSlider('#fov', {
            value: radToDeg(renderer.fieldOfView),
            slide: (event, value) => renderer.fieldOfView = degToRad(value),
            min: 30,
            max: 160,
            name: 'FOV'
        }),

        cameraX: setupSlider('#camX', {
            value: renderer.cameraTranslation[0],
            slide: (event, value) => renderer.cameraTranslation[0] = value,
            min: minPos,
            max: maxPos,
            name: 'OffsetX',
            scrollStep: 10
        }),

        cameraY: setupSlider('#camY', {
            value: renderer.cameraTranslation[1],
            slide: (event, value) => renderer.cameraTranslation[1] = value,
            min: minPos,
            max: maxPos,
            name: 'OffsetY',
            scrollStep: 10
        }),

        cameraZ: setupSlider('#camZ', {
            value: renderer.cameraTranslation[2],
            slide: (event, value) => renderer.cameraTranslation[2] = value,
            min: minPos,
            max: maxPos,
            name: 'OffsetZ',
            scrollStep: 10
        }),

        cameraAngleX: setupSlider('#camAngleX', {
            value: radToDeg(renderer.cameraRotation[0]),
            slide: (event, value) => renderer.cameraRotation[0] = degToRad(value),
            min: -180,
            max: 180,
            name: 'CircleX'
        }),

        cameraAngleY: setupSlider('#camAngleY', {
            value: radToDeg(renderer.cameraRotation[1]),
            slide: (event, value) => renderer.cameraRotation[1] = degToRad(value),
            min: -180,
            max: 180,
            name: 'CircleY'
        }),

        targetX: setupSlider('#targetX', {
            value: renderer.targetTranslation[0],
            slide: (event, value) => renderer.targetTranslation[0] = value,
            min: minPos,
            max: maxPos,
            name: 'X',
            scrollStep: 10
        }),

        targetY: setupSlider('#targetY', {
            value: renderer.targetTranslation[1],
            slide: (event, value) => renderer.targetTranslation[1] = value,
            min: minPos,
            max: maxPos,
            name: 'Y',
            scrollStep: 10
        }),

        targetZ: setupSlider('#targetZ', {
            value: renderer.targetTranslation[2],
            slide: (event, value) => renderer.targetTranslation[2] = value,
            min: minPos,
            max: maxPos,
            name: 'Z',
            scrollStep: 10
        }),

        torusR: setupSlider('#torusR', {
            value: torusProps[0],
            slide: (e, value) => {
                torusProps[0] = value;
                updateGeometry();
            },
            min: 1,
            max: 500,
            name: 'Radius',
            scrollStep: 5
        }),

        torusSR: setupSlider('#torusSR', {
            value: torusProps[1],
            slide: (e, value) => {
                torusProps[1] = value;
                updateGeometry();
            },
            min: 1,
            max: 100,
            name: 'S Radius',
            scrollStep: 5
        }),

        torusStrips: setupSlider('#torusStrips', {
            value: torusProps[2],
            slide: (e, value) => {
                torusProps[2] = value;
                updateGeometry();
            },
            min: 2,
            max: 50,
            name: 'Strips',
            scrollStep: 1
        }),

        torusSections: setupSlider('#torusSections', {
            value: torusProps[3],
            slide: (e, value) => {
                torusProps[3] = value;
                updateGeometry();
            },
            min: 2,
            max: 30,
            name: 'Sections',
            scrollStep: 1
        }),

        cylinderRadius: setupSlider('#cylinderRadius', {
            value: cylinderProps[0],
            slide: (e, value) => {
                cylinderProps[0] = value;
                updateGeometry();
            },
            min: 1,
            max: 500,
            name: 'Radius',
            scrollStep: 5
        }),

        cylinderHeight: setupSlider('#cylinderHeight', {
            value: cylinderProps[1],
            slide: (e, value) => {
                cylinderProps[1] = value;
                updateGeometry();
            },
            min: 1,
            max: 1000,
            name: 'Height',
            scrollStep: 10
        }),

        cylinderSides: setupSlider('#cylinderSides', {
            value: cylinderProps[2],
            slide: (e, value) => {
                cylinderProps[2] = value;
                updateGeometry();
            },
            min: 2,
            max: 50,
            name: 'Sides',
            scrollStep: 1
        }),
    };
}