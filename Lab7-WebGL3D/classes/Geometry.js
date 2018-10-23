/* exported Geometry */
const Geometry = {
    makeTorus(r, sr, n, sn, k) {
        // Temporary arrays for the vertices, normals and colors
        var tv = [];
        var tc = [];
        // Iterates along the big circle and then around a section
        for (var i = 0; i < n; i++) { // Iterates over all strip rounds
            for (var j = 0; j < sn + 1 * (i == n - 1); j++) {// Iterates along the torus section
                for (var v = 0; v < 2; v++) {// Creates zigzag pattern (v equals 0 or 1)
                    // Pre-calculation of angles
                    var a = 2 * Math.PI * (i + j / sn + k * v) / n;
                    var sa = 2 * Math.PI * j / sn;
                    var x, y, z;
                    // Coordinates on the surface of the torus
                    tv.push(x = (r + sr * Math.cos(sa)) * Math.cos(a)); // X
                    tv.push(y = (r + sr * Math.cos(sa)) * Math.sin(a)); // Y
                    tv.push(z = sr * Math.sin(sa)); // Z
                    // Colors
                    tc.push(0.5 + 0.5 * x); // R
                    tc.push(0.5 + 0.5 * y); // G
                    tc.push(0.5 + 0.5 * z); // B
                    tc.push(1.0); // Alpha
                }
            }
        }

        // Converts and returns array
        return {
            vertices: tv,
            colors: tc
        };
    }
};
