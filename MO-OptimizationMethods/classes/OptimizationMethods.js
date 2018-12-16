/* exported OptimizationMethods */
const OptimizationMethods = {

    dichotomy: function*(getY, { a, b, l, ep, sign }) {
        let L = b - a;

        while (L > l) {

            let x1 = a + (L / 2) - (ep / 2);
            let x2 = a + (L / 2) + (ep / 2);
            let y1 = getY(x1);
            let y2 = getY(x2);

            if (Math.sign(y2 - y1) == sign) {
                a = x1;
            }
            else if (Math.sign(y1 - y2) == sign) {
                b = x2;
            }

            yield [a, b];

            L = b - a;
        }

        return [a, b];
    },

    goldenRatio: function* (getY, { a, b, l, sign }) {
        let c = 1.618;
        let L = b - a;

        while (L > l) {

            let x1 = a + L / c;
            let x2 = b - L / c;
            let y1 = getY(x1);
            let y2 = getY(x2);

            if (Math.sign(y2 - y1) == sign) {
                b = x1;
            }
            else if (Math.sign(y1 - y2) == sign) {
                a = x2;
            }

            L = b - a;

            yield [a, b];
        }

        return [a, b];
    },

    fibonacci: function* (getY, { a, b, l, ep, sign }) {

        function fib(num) {
            let a = 1, b = 0;

            while (num >= 0) {
                [a, b] = [a + b, a];
                num--;
            }

            return b;
        }

        let L = b - a;
        let n = (b - a) / l;
        let k1 = 1, k = 1, p = 1, count = 1;

        while (k < n) {
            p = k;
            k = k + k1;
            k1 = p;
            count++;
        }

        while (count > 0) {

            L = b - a;
            let m1 = L / fib(count);
            let x1 = a + m1 * fib(count - 2);
            let y1 = getY(x1);
            let x2 = b - m1 * fib(count - 2);
            let y2 = getY(x2);

            if (Math.sign(y2 - y1) == sign) {
                a = x1;
            }
            else if (Math.sign(y1 - y2) == sign) {
                b = x2;
            }

            count--;

            yield [a, b];
        }

        return [a, b];
    }
};
