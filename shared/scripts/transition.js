let buttonBack = $('.button_floating.back');
let buttonForward = $('.button_floating.forward');
let cards = $('.card');
let main = $('main');
let body = $('body');

let indexHtml = location.host ? '' : 'index.html';

if(buttonBack.length > 0) {
    addArrowClickEvent(buttonBack, 'back');
}

if (buttonForward.length > 0) {
    addArrowClickEvent(buttonForward, 'forward');
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

    body.addClass('transition');
    main.show().addClass('ready');
    main.removeClass('back forward middle');
    setTimeout(() => {
        body.removeClass('transition');
    }, 500)


function addArrowClickEvent(button, direction) {
    button.click((event) => {
        main.removeClass('ready');
        main.addClass('transition');
        main.addClass(direction);
        body.addClass('transition');
        setTimeout(() => {
            location.href = button.attr('href') + '#' + direction;
        }, location.host ? 125 : 200);
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
        let cardCopy = card.clone();
        cardCopy.css({
            left: offset.left - 8 + 'px',
            top: offset.top - 8 + 'px'
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
        }, 300);
        return false;
    });

    card.attr('href', (i, attr) => {
        return attr + '/' + indexHtml;
    })
}