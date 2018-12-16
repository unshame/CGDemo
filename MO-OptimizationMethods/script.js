window.pageNum = 99;

let plotter = new OptimizationMethodPlotter('graph', 'stats');

$(() => {
    let plotlyUrl = '../shared/lib/plotly-latest.js';
    $.getScript(plotlyUrl, () => {
        $('.elevated').addClass('loaded');
        $('#controls').show();
    });
});

$('#controls').on('submit', (e) => {
    e.preventDefault();
    plot();
});


function plot() {
    try {
        plotter.plotGraph(
            eval('x => ' + $('#getY').val()),
            OptimizationMethods[$('#method').val()],
            parseInt($('#interval').val()),
            {
                a: parseFloat($('#a').val()),
                b: parseFloat($('#a').val()) + parseFloat($('#ab').val()),
                l: parseFloat($('#l').val()),
                ep: parseFloat($('#ep').val()),
                sign: $('#limit').val() == 'max' ? 1 : -1,
                step: 0.5
            }
        );
    }
    catch(err) {
        console.error(err);
        alert('Invalid input');
    }
}