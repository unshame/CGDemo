let buttonBack = $('.button_floating.back');
let buttonForward = $('.button_floating.forward');
let buttonHome = $('.button_toolbar.close');
let buttonHomeSide = $('.button_floating.home');
let cards = $('.card');
let main = $('main');
let body = $('body');
let wndow = $(window);

let transitionRelation = {
    'back': 'forward',
    'forward': 'back'
};

let indexHtml = location.host ? '' : 'index.html';

if(buttonBack.length > 0) {
    addArrowClickEvent(buttonBack, 'back', 175, 200);
}

if (buttonForward.length > 0) {
    addArrowClickEvent(buttonForward, 'forward', 175, 200);
}

if (buttonHome.length > 0) {
    addArrowClickEvent(buttonHome, 'middle', 200, 200, window.pageNum);
}

if (buttonHomeSide.length > 0) {
    addArrowClickEvent(buttonHomeSide, 'middle', 200, 200, window.pageNum);
}

if(cards.length > 0) {
    cards.each((i, card) => {
        addCardTransition($(card), i + 1);
    });
}

processTransition(location.hash);


function processTransition(hash) {
    let transition, pageNum;

    if (!hash || hash.length === 0) {
        main.addClass('ready');
        return;
    }

    transition = location.hash.substr(1);
    history.replaceState(null, null, '#');

    if (transition.startsWith('middle')) {
        pageNum = parseInt(transition.substr('middle'.length), 10) || 0;
        pageNum = Math.min(Math.max(pageNum, 1), cards.length);
        transition = 'middle';
    }
    else {
        transition = transitionRelation[transition] || transition;
    }

    main.addClass(transition);

    if (cards.length == 0) {
        body.addClass('transition');
        main.show().addClass('ready');

        main.removeClass(transition);

        setTimeout(() => {
            body.removeClass('transition');
        }, 500);
    }
    else {
        let card = cards[pageNum - 1];

        if(!card) {
            console.error('No card for page', pageNum);
            main.addClass('ready');
            return;
        }

        card = $(card);
        let cardCopy = copyCard(card);
        cardCopy.appendTo(body);
        centerCard(cardCopy);
        moveCardToCard(cardCopy, card);
        card.css('opacity', 0);
        card.addClass('card_force_hover');
        animateAllCardsExcept(card[0], 'visible');

        setTimeout(() => {
            main.addClass('ready');
            cardCopy.detach();
            card.css('opacity', '');
            card.removeClass('card_force_hover');
            cards.removeClass('visible');
        }, 300);
    }

}

function addArrowClickEvent(button, direction, time, timeLocal, pageNum = '') {
    button.click((event) => {
        main.removeClass('ready');
        main.addClass('transition');
        main.addClass(direction);
        body.addClass('transition');

        setTimeout(() => {
            location.href = button.attr('href') + '#' + direction + pageNum;
        }, location.host ? time : timeLocal);

        return false;
    });

    button.attr('href', (i, attr) => {
        return attr + '/' + indexHtml;
    });
}

function addCardTransition(card, index) {
    card.click((event) => {

        if(!main.hasClass('ready')) {
            return false;
        }

        let cardCopy = copyCard(card);
        moveCardToCard(cardCopy, card);

        cardCopy.appendTo(body);
        card.css('opacity', 0);
        centerCard(cardCopy);

        main.addClass('transition');
        body.addClass('transition');

        setTimeout(() => {
            location.href = card.attr('href') + '#middle';
        }, 200);

        animateAllCardsExcept(card[0], 'invisible');
        return false;
    });

    card.attr('href', (i, attr) => {
        return attr + '/' + indexHtml;
    });
}

function copyCard(card) {
    let cardCopy = card.clone();
    cardCopy.addClass('card_copy');
    return cardCopy;
}

function centerCard(card) {
    card.css({
        left: wndow.width() / 2 - card.width() / 2 + window.pageXOffset - 20 + 'px',
        top: wndow.height() / 2 - card.height() / 2 + window.pageYOffset - 20 + 'px'
    });
}

function moveCardToCard(cardCopy, card) {
    let offset = card.offset();
    let margin = parseInt(card.css('margin-left'), 10) || 0;

    cardCopy.css({
        left: offset.left - margin + 'px',
        top: offset.top - margin + 'px'
    });
}

function animateAllCardsExcept(card, className) {

    cards.each((i, otherCard) => {
        otherCard = otherCard;

        if (otherCard != card) {
            $(otherCard).addClass(className);
        }
    });
}

// Hack to force Firefox to reload on back button
window.onunload = function () { };
