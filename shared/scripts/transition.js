let buttonBack = $('.button_floating.back');
let buttonForward = $('.button_floating.forward');
let buttonHome = $('.button_toolbar.close');
let buttonHomeSide = $('.button_floating.home');
let cards = $('.card');
let main = $('main');
let body = $('body');

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
        animateAllCardsExcept(card[0], { opacity: 1 }, 300);

        setTimeout(() => {
            main.addClass('ready');
            cardCopy.detach();
            card.css('opacity', 1);
            card.removeClass('card_force_hover');
        }, 300);
    }

}

function addArrowClickEvent(button, direction, time, timeLocal, pageNum) {
    button.click((event) => {
        main.removeClass('ready');
        main.addClass('transition');
        main.addClass(direction);
        body.addClass('transition');

        setTimeout(() => {
            location.href = button.attr('href') + '#' + direction + (pageNum !== undefined ? pageNum : '');
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

        animateAllCardsExcept(card[0], {opacity: 0 }, 150);
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
        left: body.width() / 2 - card.width() / 2 + 'px',
        top: body.height() / 2 - card.height() / 2 - 20 + 'px'
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

function animateAllCardsExcept(card, animation, time) {

    cards.each((i, otherCard) => {
        otherCard = otherCard;

        if (otherCard != card) {
            $(otherCard).animate(animation, time);
        }
    });
}

body.append(
    `<a href="https://github.com/unshame/CGDemo" class="github-corner" aria-label="View source on Github">
        <svg width="80" height="80" viewBox="0 0 250 250" aria-hidden="true">
            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
            <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
                fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
            <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
                fill="currentColor" class="octo-body"></path>
        </svg>
    </a>`
);

// Hack to force Firefox to reload on back button
window.onunload = function () { };
