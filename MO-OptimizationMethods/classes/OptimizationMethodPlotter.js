/* exported OptimizationMethodPlotter */
class OptimizationMethodPlotter {

    constructor(graphId, resultId) {
        this.graphId = graphId;
        this.resultId = resultId;

        this.intervalId = null;
    }

    /** Выводит гистограмму и статистику изображения. */
    plotGraph(getY, optimizationMethod, interval, params) {

        if (!window.Plotly) {
            return;
        }

        let resultNode = document.getElementById(this.resultId);
        resultNode.innerHTML = '';

        let { a, b, step } = params;
        Plotly.newPlot(
            this.graphId,
            this._generateTraces(getY, a, b, step),
            this._generateLayout(a, b)
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

            resultNode.innerHTML = `${params.sign == 1 ? 'Max' : 'Min'}: [${newA.toFixed(2)}, ${newB.toFixed(2)}]`;
        }, interval);
    }

    _generateTraces(getY, a, b, step) {
        let xs = [];
        let ys = [];

        for (let i = a; i < b; i = Math.min(b, i + step)) {
            xs.push(i);
            ys.push(getY(i));
        }

        xs.push(b);
        ys.push(getY(b));

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
            type: 'scatter',
            hoverinfo: 'none'
        };

        return [plot, solutionStepsA, solutionStepsB, solution];
    }

    _generateLayout(a, b) {
        return {
            legend: {
                y: 0.5,
                traceorder: 'reversed',
                font: { size: 16 },
                yref: 'paper'
            },
            xaxis: {
                range: [a - 1, b + 1]
            }
        };
    }
}