Array.prototype.shuffle = function () {
    var i = this.length, j, tempi, tempj;
    if (i === 0)
        return this;
    while (--i) {
        j = Math.floor (Math.random () * (i + 1));
        tempi = this[i];
        tempj = this[j];
        this[i] = tempj;
        this[j] = tempi;
    }
    return this;
};

var cards;
var prevID, currID;
var tmpPrevID, tmpCurrID;
var hideNext;


var totalClicks;
var totalCards;
var pairsLeft;
var SS = {
    coords: [[1, 4], [0, 4], [0, 4], [0, 1]]
};


$ (document).ready (function () {
    $ ('#newGameLarge').on ('click', function () {
        if (pairsLeft === 0 || totalCards === pairsLeft || confirm ("Current game will be trashed, continue?"))
            SS.newGame (true);
    });

    $ ('#newGameSmall').on ('click', function () {
        if (pairsLeft === 0 || totalCards === pairsLeft || confirm ("Current game will be trashed, continue?"))
            SS.newGame (false);
    });

    SS.newGame (Math.min (screen.width, screen.height) > 600);
});

SS.newGame = function (large) {
    cards = [];
    var size = large === true ? 128 : 64;
    for (var row = 0; row < SS.coords.length; row++) {
        for (var col = SS.coords[row][0]; col < SS.coords[row][1]; col++) {
            cards.push ({y: -row * size, x: -col * size, id: "a" + (row * 4 + col)});
            cards.push ({y: -row * size, x: -col * size, id: "b" + (row * 4 + col)});
        }
    }
    cards.shuffle ();

    var innerHTML = "";
    for (var i = 0, l = cards.length; i < l; i++) {
        innerHTML += SS.createCard (cards[i], size === 128 ? 'large' : 'small');
    }

    $ ('#cards').html (innerHTML);
    $ ('#cards .card').on ('click', SS.onCardClick);

    totalClicks = 0;
    totalCards = cards.length / 2;
    pairsLeft = totalCards;
    prevID = currID = tmpCurrID = tmpPrevID = null;
};


SS.onCardClick = function (event) {
    console.log (event);

    //# border issue #01
    if (event.target.parentNode.nodeName !== "LI")
        return;

    currID = $ (event.target.parentNode).attr ('id');
    //# ignoring same card
    if (currID === prevID) {
        return;
    } else {
        totalClicks++;
    }

    //# hide those two cards and reset sign
    if (hideNext === true) {
        //# hide images
        $ ('#' + tmpPrevID + ' .card-image').hide ();
        $ ('#' + tmpCurrID + ' .card-image').hide ();
        //# show covers
        $ ('#' + tmpPrevID + ' .card-cover').show ();
        $ ('#' + tmpCurrID + ' .card-cover').show ();
        hideNext = false;
        tmpPrevID = null;
        tmpCurrID = null;
    }

    //# new card reveal
    if (prevID === null) {
        prevID = currID;
        $ ('#' + prevID + ' .card-image').show ();
        $ ('#' + prevID + ' .card-cover').hide ();
    } else {

        //# show images
        $ ('#' + prevID + ' .card-image').show ();
        $ ('#' + currID + ' .card-image').show ();

        //# hide covers
        $ ('#' + prevID + ' .card-cover').hide ();
        $ ('#' + currID + ' .card-cover').hide ();

        //# same card?
        if (currID.substr (1) === prevID.substr (1)) {
            //# remove listener
            $ ('#' + prevID + '').on ('click', SS.onCardClick, true);
            $ ('#' + currID + '').on ('click', SS.onCardClick, true);
            //# add class indicating completion
            $ ('#' + prevID + '').cls ('solved', 'add');
            $ ('#' + currID + '').cls ('solved', 'add');
            pairsLeft--;
        } else {
            hideNext = true;
            //# save ids
            tmpPrevID = prevID;
            tmpCurrID = currID;
        }

        //# reseting previous ID
        prevID = null;
    }

    SS.updateStatistics ();

    //# game over?
    if (pairsLeft === 0) {
        var accuracy = Math.round (100 * (totalCards - pairsLeft) / (totalClicks / 2));
        alert ('Game over, and ... ehm ... you won!' +
                '\n  Total clicks: ' + totalClicks +
                '\n  Acccracy: ' + accuracy + '%');
    }

    event.preventDefault ();
    event.stopImmediatePropagation ();
    event.stopPropagation ();
};

SS.createCard = function (a, large) {
    return '\
        <li class="' + large + ' card" id="' + a.id + '">\
            <div class="card-cover"></div>\
            <div class="card-image" style="background-position: ' + a.x + 'px ' + a.y + 'px; display:none"></div>\
        </li>';
};

SS.updateStatistics = function () {
    var accuracy = Math.round (100 * (totalCards - pairsLeft) / (totalClicks / 2));
    $ ('#totalClicks').html ('Total clicks: ' + totalClicks + ', ');
    $ ('#revealAccuracy').html ('Acccracy: ' + accuracy + '%, ');
    $ ('#pairsLeft').html ('Pairs left: ' + pairsLeft + '');
};