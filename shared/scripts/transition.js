let buttonBack = $('.button_floating.back');
let buttonForward = $('.button_floating.forward');
let main = $('main');
let body = $('body');

let indexHtml = location.host ? '' : 'index.html';

if(buttonBack.length > 0) {
    addArrowClickEvent(buttonBack, 'back', event)
}

if (buttonForward.length > 0) {
    addArrowClickEvent(buttonForward, 'forward', event)
}

$(() => {
    if (location.hash.search('#back') != -1) {
        main.addClass('forward');
    }
    else if (location.hash.search('#forward') != -1) {
        main.addClass('back');
    }

    location.hash = '';

    body.addClass('transition');
    main.show().addClass('ready');
    main.removeClass('back');
    main.removeClass('forward');
    setTimeout(() => {
        body.removeClass('transition');
    }, 500)
});


function addArrowClickEvent(button, direction, event) {
    button.click((event) => {
        main.removeClass('ready');
        main.addClass('transition');
        main.addClass(direction);
        body.addClass('transition');
        setTimeout(() => {
            location.href = button.attr('href');
        }, location.host ? 100 : 150);
        return false;
    });

    button.attr('href', (i, attr) => {
        return attr + '/' + indexHtml + '#' + direction;
    })
}