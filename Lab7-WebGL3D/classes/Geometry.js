/* exported Geometry */
const Geometry = {
    makeTorus(radius, stripRadius, numStrips, numSections) {

        let vertices = [];
        let texcoords = [];

        // Iterates along the big circle and then around a section
        for (let i = 0; i < numStrips; i++) { // Iterates over all strip rounds
            for (let j = 0; j < numSections + 1 * (i == numStrips - 1); j++) {// Iterates along the torus section
                for (let v = 0; v < 2; v++) {// Creates zigzag pattern (v equals 0 or 1)

                    // Pre-calculation of angles
                    let a = 2 * Math.PI * (i + j / numSections + v) / numStrips;
                    let sa = 2 * Math.PI * j / numSections;

                    // Coordinates on the surface of the torus
                    let x = (radius + stripRadius * Math.cos(sa)) * Math.cos(a); // X
                    let y = (radius + stripRadius * Math.cos(sa)) * Math.sin(a); // Y
                    let z = stripRadius * Math.sin(sa); // Z

                    _pushVertex(vertices, x, y, z);
                    _pushVertex(texcoords, (i + v) / numStrips, j < numSections ? (j + 1) / numSections : 0);
                }
            }
        }

        return { vertices, texcoords };
    },

    makeCylinder(radius, height, numSides) {
        let vertices = [];
        let texcoords = [];

        let offsetY = -height / 2;

        function drawCap(y, invert) {
            for (let i = 0; i <= numSides; i++) {
                let x = radius * Math.cos(i / numSides * Math.PI * 2);
                let z = radius * Math.sin(i / numSides * Math.PI * 2);
                _pushVertex(vertices, invert ? x : 0, y, invert ? z : 0);
                _pushVertex(vertices, invert ? 0 : x, y, invert ? 0 : z);
                _pushVertex(texcoords, i / numSides, 1);
                _pushVertex(texcoords, 0, 0);
            }
        }

        drawCap(offsetY, false);

        for (let i = 0; i <= numSides; i++) {
            let y = offsetY + height;
            let x = radius * Math.cos(i / numSides * Math.PI * 2);
            let z = radius * Math.sin(i / numSides * Math.PI * 2);
            _pushVertex(vertices, x, offsetY, z);
            _pushVertex(vertices, x, y, z);
            _pushVertex(texcoords, (numSides - i) / numSides, 1);
            _pushVertex(texcoords, (numSides - i) / numSides, 0);
        }

        drawCap(offsetY + height, true);

        return { vertices, texcoords };
    }

};

function _pushVertex(array, ...components) {
    for(let component of components) {
        array.push(component);
    }
}
