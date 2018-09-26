
// Проверяет, что точка лежит с правильной стороны от линии
function inside(p, cp1, cp2, isClockwise) {
    let d = (cp2.y - cp1.y) * (p.x - cp1.x) - (cp2.x - cp1.x) * (p.y - cp1.y);
    return isClockwise ? d < 0 : d > 0;
};

function intersection(cp1, cp2, s, e) {

    let dc = {
        x: cp1.x - cp2.x,
        y: cp1.y - cp2.y
    };

    let dp = {
        x: s.x - e.x,
        y: s.y - e.y
    };
    let n1 = cp1.x * cp2.y - cp1.y * cp2.x;
    let n2 = s.x * e.y - s.y * e.x;
    let n3 = 1.0 / (dc.x * dp.y - dc.y * dp.x);

    return {
        x: (n1 * dp.x - n2 * dc.x) * n3,
        y: (n1 * dp.y - n2 * dc.y) * n3
    };
};

function polygonIsClockwise(polygon) {

    let product = 0;

    for(let i = 0; i < polygon.length; i++) {
        let p1 = polygon[i];
        let p2 = polygon[i + 1] || polygon[0];
        product += (p2.x - p1.x) * (p2.y + p1.y);
    }

    return product < 0;
}

function clip(subjectPolygon, clipPolygon) {

    let cp1, e;
    let outputList = subjectPolygon;
    cp1 = clipPolygon[clipPolygon.length - 1];
    let isClockwise = polygonIsClockwise(clipPolygon);

    for (let j in clipPolygon) {
        let cp2 = clipPolygon[j];
        let inputList = outputList;
        let s = inputList[inputList.length - 1];
        outputList = [];

        for (let i in inputList) {
            e = inputList[i];

            if (inside(e, cp1, cp2, isClockwise)) {

                if (!inside(s, cp1, cp2, isClockwise)) {
                    outputList.push(intersection(cp1, cp2, s, e));
                }

                outputList.push(e);
            }
            else if (inside(s, cp1, cp2, isClockwise)) {
                outputList.push(intersection(cp1, cp2, s, e));
            }

            s = e;
        }

        cp1 = cp2;
    }
    return outputList;
}

function drawPolygon(context, polygon, strokeStyle, fillStyle) {
    if (polygon.length === 0) {
        return;
    }
    context.strokeStyle = strokeStyle;
    context.fillStyle = fillStyle;
    context.beginPath();
    context.moveTo(polygon[0].x, polygon[0].y); //first vertex
    for (let i = 1; i < polygon.length; i++){
        context.lineTo(polygon[i].x, polygon[i].y);
    }
    context.lineTo(polygon[0].x, polygon[0].y); //back to start
    context.fill();
    context.stroke();
    context.closePath();
}

window.onload = function () {
    let context = document.getElementById('canvas').getContext('2d');
    let subjectPolygon = [
        { x: 50, y: 150 }, 
        { x: 200, y: 50 }, 
        { x: 350, y: 150 }, 
        { x: 350, y: 300 }, 
        { x: 250, y: 300 }, 
        { x: 200, y: 250 }, 
        { x: 150, y: 350 }, 
        { x: 100, y: 250 }, 
        { x: 100, y: 200 }
    ];
    let clipPolygon = [];
    clipPolygon = [
        { x: 300, y: 100 },
        { x: 200, y: 100 },
        { x: 100, y: 200 },
        { x: 200, y: 200 },
    ];
    clipPolygon = [
        { x: 300, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 },
        { x: 200, y: 100 },
    ];

    let clippedPolygon = clip(subjectPolygon, clipPolygon);
    drawPolygon(context, clipPolygon, '#888', '#88f');
    drawPolygon(context, subjectPolygon, '#888', '#8f8');
    drawPolygon(context, clippedPolygon, '#000', '#0ff');
};