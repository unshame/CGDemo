/* exported Geometry */
const Geometry = {
    makeTorus(r, sr, n, sn, k) {

        var vertices = [];
        var colors = [];

        // Iterates along the big circle and then around a section
        for (var i = 0; i < n; i++) { // Iterates over all strip rounds
            for (var j = 0; j < sn + 1 * (i == n - 1); j++) {// Iterates along the torus section
                for (var v = 0; v < 2; v++) {// Creates zigzag pattern (v equals 0 or 1)

                    // Pre-calculation of angles
                    var a = 2 * Math.PI * (i + j / sn + k * v) / n;
                    var sa = 2 * Math.PI * j / sn;
                    var x, y, z;

                    // Coordinates on the surface of the torus
                    vertices.push(x = (r + sr * Math.cos(sa)) * Math.cos(a)); // X
                    vertices.push(y = (r + sr * Math.cos(sa)) * Math.sin(a)); // Y
                    vertices.push(z = sr * Math.sin(sa)); // Z

                    // Colors
                    colors.push(0.5 + 0.5 * x); // R
                    colors.push(0.5 + 0.5 * y); // G
                    colors.push(0.5 + 0.5 * z); // B
                    colors.push(1.0); // Alpha
                }
            }
        }

        return {vertices, colors};
    }
};
