/* exported setupSliders */
function setupSliders(renderer, textures) {

    const minPos = -1500;
    const maxPos = 1500;

    let configs = {

        x: {
            value: renderer.translation[0],
            slide: (event, value) => renderer.translation[0] = value,
            min: minPos,
            max: maxPos,
            scrollStep: 10
        },

        y: {
            value: renderer.translation[1],
            slide: (event, value) => renderer.translation[1] = value,
            min: minPos,
            max: maxPos,
            scrollStep: 10
        },

        z: {
            value: renderer.translation[2],
            slide: (event, value) => renderer.translation[2] = value,
            min: minPos,
            max: maxPos,
            scrollStep: 10
        },

        angleX: {
            value: radToDeg(renderer.rotation[0]),
            slide: (event, value) => renderer.rotation[0] = degToRad(value),
            min: -180,
            max: 180,
        },

        angleY: {
            value: radToDeg(renderer.rotation[1]),
            slide: (event, value) => renderer.rotation[1] = degToRad(value),
            min: -180,
            max: 180,
        },

        angleZ: {
            value: radToDeg(renderer.rotation[2]),
            slide: (event, value) => renderer.rotation[2] = degToRad(value),
            min: -180,
            max: 180,
        },

        amount: {
            value: renderer.numObjects,
            slide: (event, value) => renderer.numObjects = value,
            min: 1,
            max: 50,
        },

        spacing: {
            value: renderer.sceneRadius,
            slide: (event, value) => renderer.sceneRadius = value,
            min: 0,
            max: 900,
        },

        scale: {
            value: renderer.scale[0],
            slide: (event, value) => renderer.scale.fill(value),
            min: -2,
            max: 2,
            step: 0.01,
            precision: 2,
        },

        rotationX: {
            value: radToDeg(renderer.objectRotationRate[0]),
            slide: (event, value) => renderer.objectRotationRate[0] = degToRad(value),
            min: -9,
            max: 9,
            scrollStep: 1
        },

        rotationY: {
            value: radToDeg(renderer.objectRotationRate[1]),
            slide: (event, value) => renderer.objectRotationRate[1] = degToRad(value),
            min: -9,
            max: 9,
            scrollStep: 1
        },

        rotationZ: {
            value: radToDeg(renderer.objectRotationRate[2]),
            slide: (event, value) => renderer.objectRotationRate[2] = degToRad(value),
            min: -9,
            max: 9,
            scrollStep: 1
        },

        fov: {
            value: radToDeg(renderer.fieldOfView),
            slide: (event, value) => renderer.fieldOfView = degToRad(value),
            min: 30,
            max: 160,
            name: 'FOV'
        },

        camX: {
            value: renderer.cameraTranslation[0],
            slide: (event, value) => renderer.cameraTranslation[0] = value,
            min: minPos,
            max: maxPos,
            name: 'OffsetX',
            scrollStep: 10
        },

        camY: {
            value: renderer.cameraTranslation[1],
            slide: (event, value) => renderer.cameraTranslation[1] = value,
            min: minPos,
            max: maxPos,
            name: 'OffsetY',
            scrollStep: 10
        },

        camZ: {
            value: renderer.cameraTranslation[2],
            slide: (event, value) => renderer.cameraTranslation[2] = value,
            min: minPos,
            max: maxPos,
            name: 'OffsetZ',
            scrollStep: 10
        },

        camAngleX: {
            value: radToDeg(renderer.cameraRotation[0]),
            slide: (event, value) => renderer.cameraRotation[0] = degToRad(value),
            min: -180,
            max: 180,
            name: 'CircleX'
        },

        camAngleY: {
            value: radToDeg(renderer.cameraRotation[1]),
            slide: (event, value) => renderer.cameraRotation[1] = degToRad(value),
            min: -180,
            max: 180,
            name: 'CircleY'
        },

        targetX: {
            value: renderer.targetTranslation[0],
            slide: (event, value) => renderer.targetTranslation[0] = value,
            min: minPos,
            max: maxPos,
            name: 'X',
            scrollStep: 10
        },

        targetY: {
            value: renderer.targetTranslation[1],
            slide: (event, value) => renderer.targetTranslation[1] = value,
            min: minPos,
            max: maxPos,
            name: 'Y',
            scrollStep: 10
        },

        targetZ: {
            value: renderer.targetTranslation[2],
            slide: (event, value) => renderer.targetTranslation[2] = value,
            min: minPos,
            max: maxPos,
            name: 'Z',
            scrollStep: 10
        },

        torusR: {
            value: torusProps[0],
            slide: (e, value) => {
                torusProps[0] = value;
                updateGeometry();
            },
            min: 1,
            max: 500,
            name: 'Radius',
            scrollStep: 5
        },

        torusSR: {
            value: torusProps[1],
            slide: (e, value) => {
                torusProps[1] = value;
                updateGeometry();
            },
            min: 1,
            max: 100,
            name: 'S Radius',
            scrollStep: 5
        },

        torusStrips: {
            value: torusProps[2],
            slide: (e, value) => {
                torusProps[2] = value;
                updateGeometry();
            },
            min: 2,
            max: 50,
            name: 'Strips',
            scrollStep: 1
        },

        torusSections: {
            value: torusProps[3],
            slide: (e, value) => {
                torusProps[3] = value;
                updateGeometry();
            },
            min: 2,
            max: 30,
            name: 'Sections',
            scrollStep: 1
        },

        cylinderRadius: {
            value: cylinderProps[0],
            slide: (e, value) => {
                cylinderProps[0] = value;
                updateGeometry();
            },
            min: 1,
            max: 500,
            name: 'Radius',
            scrollStep: 5
        },

        cylinderHeight: {
            value: cylinderProps[1],
            slide: (e, value) => {
                cylinderProps[1] = value;
                updateGeometry();
            },
            min: 1,
            max: 1000,
            name: 'Height',
            scrollStep: 10
        },

        cylinderSides: {
            value: cylinderProps[2],
            slide: (e, value) => {
                cylinderProps[2] = value;
                updateGeometry();
            },
            min: 2,
            max: 50,
            name: 'Sides',
            scrollStep: 1
        },

        alpha: {
            value: renderer.alphaValue,
            slide: (e, value) => renderer.setAlpha(renderer.alphaEnabled, value),
            min: 0,
            max: 255,
            scrollStep: 5
        },

        texture: {
            value: 0,
            slide: (e, value) => renderer.loadTexture(textures[value]),
            min: 0,
            max: textures.length - 1,
            scrollStep: 1
        },

        lightX: {
            value: renderer.lightDirection[0],
            slide: (event, value) => renderer.lightDirection[0] = value,
            min: -1,
            max: 1,
            step: 0.01,
            precision: 2,
            name: 'DirectionX'
        },

        lightY: {
            value: renderer.lightDirection[1],
            slide: (event, value) => renderer.lightDirection[1] = value,
            min: -1,
            max: 1,
            step: 0.01,
            precision: 2,
            name: 'DirectionY'
        },

        lightZ: {
            value: renderer.lightDirection[2],
            slide: (event, value) => renderer.lightDirection[2] = value,
            min: -1,
            max: 1,
            step: 0.01,
            precision: 2,
            name: 'DirectionZ'
        },

        ambient: {
            value: renderer.ambientLight,
            slide: (event, value) => renderer.ambientLight = value,
            min: 0,
            max: 2,
            step: 0.01,
            precision: 2,
        },
    };

    let sliders = {};
    for(let key of Object.keys(configs)) {
        sliders[key] = createSliderFromSelector('#' + key, configs[key]);
    }

    return sliders;
}