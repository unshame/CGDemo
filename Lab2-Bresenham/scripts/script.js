let mode = 'line';
let $ = window.$;
let buttonLine = $('#button_line');
let buttonCircle = $('#button_circle');

function setMode(_mode) {
    let [on, off] = _mode == 'line' ? [buttonLine, buttonCircle] : [buttonCircle, buttonLine];
    on.addClass('active');
    off.removeClass('active');
    return mode;
}

buttonLine.click(() => setMode('line'));
buttonCircle.click(() => setMode('circle'));

setMode('line');