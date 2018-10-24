/* exported Geometry */
const Geometry = {
    makeTorus(radius, stripRadius, numStrips, numSections) {

        let vertices = [];

        // Iterates along the big circle and then around a section
        for (let i = 0; i < numStrips; i++) { // Iterates over all strip rounds
            for (let j = 0; j < numSections + 1 * (i == numStrips - 1); j++) {// Iterates along the torus section
                for (let v = 0; v < 2; v++) {// Creates zigzag pattern (v equals 0 or 1)

                    // Pre-calculation of angles
                    let a = 2 * Math.PI * (i + j / numSections + v) / numStrips;
                    let sa = 2 * Math.PI * j / numSections;

                    // Coordinates on the surface of the torus
                    vertices.push((radius + stripRadius * Math.cos(sa)) * Math.cos(a)); // X
                    vertices.push((radius + stripRadius * Math.cos(sa)) * Math.sin(a)); // Y
                    vertices.push(stripRadius * Math.sin(sa)); // Z
                }
            }
        }

        return vertices;
    },

    makeCylinder(radius, height, numSides) {
        let vertices = [];

        let offsetY = -height / 2;

        function drawCap(y, invert) {
            for (let i = 0; i <= numSides; i++) {
                let x = radius * Math.cos(i / numSides * Math.PI * 2);
                let z = radius * Math.sin(i / numSides * Math.PI * 2);
                vertices.push(invert ? x : 0);
                vertices.push(y);
                vertices.push(invert ? z : 0);
                vertices.push(invert ? 0 : x);
                vertices.push(y);
                vertices.push(invert ? 0 : z);
            }
        }

        drawCap(offsetY, false);

        for (let i = 0; i <= numSides; i++) {
            let y = offsetY + height;
            let x = radius * Math.cos(i / numSides * Math.PI * 2);
            let z = radius * Math.sin(i / numSides * Math.PI * 2);
            vertices.push(x);
            vertices.push(offsetY);
            vertices.push(z);
            vertices.push(x);
            vertices.push(y);
            vertices.push(z);
        }

        drawCap(offsetY + height, true);

        return vertices;
    }

};
