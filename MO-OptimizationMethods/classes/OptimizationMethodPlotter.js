/* exported OptimizationMethodPlotter */
class OptimizationMethodPlotter {

    constructor(graphId) {
        this.graphId = graphId;

        this.intervalId = null;
    }

    /** Выводит гистограмму и статистику изображения. */
    plotGraph(getY, optimizationMethod, interval = 200, params) {

        if (!window.Plotly) {
            return;
        }

        let { a, b } = params;
        Plotly.newPlot(
            this.graphId,
            this._generateTraces(getY, a, b),
            this._getLayout()
        );

        let optimize = optimizationMethod(getY, params);
        let allAs = [], allBs = [];

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {

            let iteration = optimize.next();
            let [newA, newB] = iteration.value;
            allAs.push(newA);
            allBs.push(newB);

            if (!iteration.done) {
                Plotly.restyle(this.graphId, {
                    x: [[newA], [newB]],
                    y: [[getY(newA)], [getY(newB)]]
                }, [1, 2]).catch(err => { });
                return;
            }

            clearInterval(this.intervalId);
            this.intervalId = null;

            Plotly.restyle(this.graphId, {
                x: [
                    allAs,
                    allBs,
                    [newA, newB]
                ],
                y: [
                    allAs.map(x => getY(x)),
                    allBs.map(x => getY(x)),
                    [getY(newA), getY(newB)]
                ]
            }, [1, 2, 3]).catch(err => { });
        }, interval);
    }

    _generateTraces(getY, a, b) {
        let xs = [];
        let ys = [];

        for (let i = a; i <= b; i++) {
            xs.push(i);
            ys.push(getY(i));
        }

        let solutionStepsA = {
            x: [a],
            y: [getY(a)],
            name: 'Interim A',
            mode: 'markers',
            type: 'scatter'
        };

        let solutionStepsB = {
            x: [b],
            y: [getY(b)],
            name: 'Interim B',
            mode: 'markers',
            type: 'scatter'
        };

        let solution = {
            x: [],
            y: [],
            mode: 'markers',
            type: 'scatter',
            name: 'Solution',
            marker: {
                color: 'red',
                size: 10
            }
        };

        let plot = {
            x: xs,
            y: ys,
            name: 'Function',
            mode: 'lines',
            line: { shape: 'spline' },
            type: 'scatter'
        };

        return [plot, solutionStepsA, solutionStepsB, solution];
    }

    _getLayout() {
        return {
            legend: {
                y: 0.5,
                traceorder: 'reversed',
                font: { size: 16 },
                yref: 'paper'
            }
        };
    }
}