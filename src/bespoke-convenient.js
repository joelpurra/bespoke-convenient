/*global Math:true, bespoke:true */

(function(Math, bespoke, ns, pluginName, undefined) {
    "use strict";

    var cv,

        plugin = function self(deck) {
            deck.createEventData = self.createEventData.bind(deck);
        },

        isNumber = function(n) {
            // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
            // From http://stackoverflow.com/a/1830844
            return !isNaN(parseFloat(n)) && isFinite(n);
        };

    // For plugins themselves
    plugin.builder = function self(pluginName) {
        var external = {},

            tag = "bespoke." + pluginName,

            generateErrorObject = function(message) {
                return new Error(tag + ": " + message);
            },

            eventNamespace = pluginName,

            eventInNamespace = function(eventName) {
                return eventNamespace + "." + eventName;
            },

            // TODO: create a second object bound to both this external object and the deck,
            // to avoid passing the deck parameter every time. (Which can be alleviated with simpler function binding though.)
            internalFire = function(deck, eventName, innerEvent, index, customData) {
                return deck.fire(eventInNamespace(eventName), deck.createEventData(eventNamespace, eventName, innerEvent, index, customData));
            },

            init = function() {
                external.generateErrorObject = generateErrorObject.bind(this);
                external.internalFire = internalFire.bind(this);
            };

        init();

        return external;
    };

    // Plugin functions expect to be executed in a deck context
    // Mimicing, and extending,the internal createEventData bespoke uses
    plugin.createEventData = function(eventNamespace, eventName, innerEvent, slide, eventData) {
        eventData = eventData || {};

        eventData.eventNamespace = eventNamespace || null;

        eventData.eventName = eventName || null;

        // Can be either a DOM/browser event or a bespoke event
        eventData.innerEvent = innerEvent || null;

        if (isNumber(slide)) {
            eventData.index = slide;
            eventData.slide = this.slides[slide];
        } else {
            eventData.index = this.slides.indexOf(slide);
            eventData.slide = slide;
        }

        return eventData;
    };

    cv = plugin.builder(pluginName);

    if (ns[pluginName] !== undefined) {
        throw cv.generateErrorObject("The " + pluginName + " plugin has already been loaded.");
    }

    ns[pluginName] = plugin;
}(Math, bespoke, bespoke.plugins, "convenient"));
