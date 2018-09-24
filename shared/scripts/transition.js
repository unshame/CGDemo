let buttonBack = $('.button_floating.back');
let buttonForward = $('.button_floating.forward');
let buttonHome = $('.button_toolbar.close');
let cards = $('.card');
let main = $('main');
let body = $('body');

let indexHtml = location.host ? '' : 'index.html';

if(buttonBack.length > 0) {
    addArrowClickEvent(buttonBack, 'back', 125, 200);
}

if (buttonForward.length > 0) {
    addArrowClickEvent(buttonForward, 'forward', 125, 200);
}

if (buttonHome.length > 0) {
    addArrowClickEvent(buttonHome, 'middle', 300, 300);
}

if(cards.length > 0) {
    cards.each((i, card) => {
        addCardTransition($(card), i + 1);
    })
}

if (location.hash.search('#back') != -1) {
    main.addClass('forward');
}
else if (location.hash.search('#forward') != -1) {
    main.addClass('back');
}
else if (location.hash.search('#middle') != -1) {
    main.addClass('middle');
}

history.replaceState(null, null, '#');

if(cards.length == 0) { 
    body.addClass('transition');
    main.show().addClass('ready');
    main.removeClass('back forward middle');
    setTimeout(() => {
        body.removeClass('transition');
    }, 500);
}
else {

}


function addArrowClickEvent(button, direction, time, timeLocal) {
    button.click((event) => {
        main.removeClass('ready');
        main.addClass('transition');
        main.addClass(direction);
        body.addClass('transition');
        setTimeout(() => {
            location.href = button.attr('href') + '#' + direction;
        }, location.host ? time : timeLocal);
        return false;
    });

    button.attr('href', (i, attr) => {
        return attr + '/' + indexHtml;
    })
}

function addCardTransition(card, index) {
    card.click((event) => {
        main.removeClass('ready');
        let offset = card.offset();
        let margin = parseInt(card.css('margin-left'), 10) || 0;
        let cardCopy = card.clone();
        cardCopy.css({
            left: offset.left - margin + 'px',
            top: offset.top - margin + 'px'
        });
        cardCopy.addClass('card_copy');
        cards.hide();
        cardCopy.appendTo(body).show();
        cardCopy.css({
            left: body.width() / 2 - cardCopy.width() / 2 + 'px',
            top: body.height() / 2 - cardCopy.height() / 2 + 'px'
        });
        main.addClass('transition');
        body.addClass('transition');
        setTimeout(() => {
            location.href = card.attr('href') + '#middle';
        }, 200);
        return false;
    });

    card.attr('href', (i, attr) => {
        return attr + '/' + indexHtml;
    })
}
