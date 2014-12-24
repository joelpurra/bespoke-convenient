/*global bespoke:true */

// You'll note that convenient isn't referenced in this demo.
// That's alright - it's meant to be used by other plugins.

(function(bespoke) {
    "use strict";

    bespoke.from("article", [
        bespoke.plugins.keys(),
        bespoke.plugins.touch(),
        bespoke.plugins.classes(),
    ]);
}(bespoke));
