/* exported Geometry */
const Geometry = {
    makeTorus(radius, stripRadius, numStrips, numSections) {

        let vertices = [];
        let normals = [];
        let texcoords = [];

        for (let i = 0; i < numStrips; i++) {
            for (let j = 0; j < numSections + 1 * (i == numStrips - 1); j++) {
                for (let v = 0; v < 2; v++) {

                    let a = 2 * Math.PI * (i + j / numSections + v) / numStrips;
                    let sa = 2 * Math.PI * j / numSections;

                    let x = (radius + stripRadius * Math.cos(sa)) * Math.cos(a);
                    let y = (radius + stripRadius * Math.cos(sa)) * Math.sin(a);
                    let z = stripRadius * Math.sin(sa);

                    let nx = Math.cos(sa) * Math.cos(a);
                    let ny = Math.cos(sa) * Math.sin(a);
                    let nz = Math.sin(sa);

                    let ux = (i + v) / numStrips + (1 / numStrips) * (j / numSections);
                    let half = (numSections) / 2;
                    let pastHalf = j > (numSections) / 2;
                    let leftover = half % 1 ? 1 / numSections : 0;
                    if(pastHalf) {
                        leftover = -leftover;
                    }
                    let jj = pastHalf ? (numSections - j) : j;
                    let uy = jj * 2 / numSections - leftover * (jj / half);

                    multiPush(vertices, x, y, z);
                    multiPush(normals, nx, ny, nz);
                    multiPush(texcoords, ux, uy);
                }
            }
        }

        return { vertices, texcoords, normals };
    },


    makeCylinder(radius, height, numSides) {
        let vertices = [];
        let normals = [];
        let texcoords = [];

        let offsetY = -height / 2;

        function drawCap(y, invert) {
            for (let i = 0; i <= numSides; i++) {
                let x = radius * Math.cos(i / numSides * Math.PI * 2);
                let z = radius * Math.sin(i / numSides * Math.PI * 2);
                multiPush(vertices, invert ? x : 0, y, invert ? z : 0);
                multiPush(vertices, invert ? 0 : x, y, invert ? 0 : z);
                multiPush(normals, 0, invert ? 1 : -1, 0);
                multiPush(normals, 0, invert ? 1 : -1, 0);

                let pastHalf = i >= (numSides) / 2;
                let ii = pastHalf ? (numSides - i) : i;
                let ux = ii * 2 / numSides;

                multiPush(texcoords, invert ? ux : 0, 1);
                multiPush(texcoords, invert ? 0 : ux, 0);
            }
        }

        drawCap(offsetY, false);

        for (let i = 0; i <= numSides; i++) {
            let y = offsetY + height;
            let nx = Math.cos(i / numSides * Math.PI * 2);
            let nz = Math.sin(i / numSides * Math.PI * 2);
            let x = radius * nx;
            let z = radius * nz;
            multiPush(vertices, x, offsetY, z);
            multiPush(vertices, x, y, z);
            multiPush(normals, nx, 0, nz);
            multiPush(normals, nx, 0, nz);
            multiPush(texcoords, (numSides - i) / numSides, 1);
            multiPush(texcoords, (numSides - i) / numSides, 0);
        }

        drawCap(offsetY + height, true);

        return { vertices, normals, texcoords };
    }

};

function multiPush(array, ...components) {
    for(let component of components) {
        array.push(component);
    }
}
