/*global console, Math:true, bespoke:true */

(function(global, console, Math, bespoke, ns, pluginName, undefined) {
    "use strict";

    var cv,

        // The defaults object is passed as a reference, and can be modified by global.convenientInit
        defaults = {
            logger: {
                log: function() {
                    // Workaround for phantom-polyfill.js problems binding console.log (window.console.log)
                    console.log.apply(console, arguments);
                }
            }
        },

        initOptions = function() {
            var merged = {};

            // Only merge known options
            merged.logger = {};
            merged.logger.log = global.convenientOptions && global.convenientOptions.logger && global.convenientOptions.logger.log || defaults.logger.log;

            global.convenientOptions = merged;
        },

        plugin = function self(deck) {
            deck.createEventData = self.createEventData.bind(deck);
        },

        isNumber = function(n) {
            // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
            // From http://stackoverflow.com/a/1830844
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        init = function() {
            initOptions();
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
            fire = function(deck, eventName, innerEvent, slide, customData) {
                return deck.fire(eventInNamespace(eventName), deck.createEventData(eventNamespace, eventName, innerEvent, slide, customData));
            },

            copyArray = function(arr) {
                return [].slice.call(arr, 0);
            },

            log = function() {
                var prefixes = [tag];

                // global.convenientOptions.logger.log is dynamic, so can't bind directly to it
                global.convenientOptions.logger.log.apply(global.convenientOptions.logger.log, prefixes.concat(copyArray(arguments)));
            },

            init = function() {
                external.generateErrorObject = generateErrorObject.bind(this);
                external.fire = fire.bind(this);
                external.copyArray = copyArray.bind(this);
                external.log = log.bind(this);
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

    init();

    ns[pluginName] = plugin;
}(this, console, Math, bespoke, bespoke.plugins, "convenient"));
