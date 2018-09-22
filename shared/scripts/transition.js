let buttonBack = $('.button_floating.back');
let buttonForward = $('.button_floating.forward');
let main = $('main');

main.addClass('ready');

if(buttonBack.length > 0) {
    buttonBack.click(() => main.addClass('back'));
}

if (buttonForward.length > 0) {
    buttonForward.click(() => main.addClass('forward'));
}
