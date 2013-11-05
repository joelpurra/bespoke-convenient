/*global document:true, bespoke:true */

(function(document, bespoke) {
    "use strict";

    var deck = bespoke.horizontal.from("article", {
        convenient: true
    }),
        goToFirstButton = document.getElementById("go-to-first"),
        goToLastButton = document.getElementById("go-to-last");

    goToFirstButton.onclick = function() {
        deck.first();
    };

    goToLastButton.onclick = function() {
        deck.last();
    };
}(document, bespoke));
