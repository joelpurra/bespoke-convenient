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

        decksStorages = [],

        storeDeck = function(deck) {
            decksStorages.push({
                deck: deck,
                storage: {}
            });
        },

        plugin = function(deck) {
            // TODO: move storing of the deck to a function called on deck activation by a plugin dependent on convenient?
            storeDeck(deck);
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
    plugin.builder = function self(options) {
        if (typeof options === "string") {
            options = {
                pluginName: options
            };
        }

        if (typeof options.pluginName !== "string") {
            throw cv.generateErrorObject("The plugin name was not properly defined.");
        }

        var external = {},

            tag = "bespoke." + options.pluginName,

            generateErrorObject = function(message) {
                return new Error(tag + ": " + message);
            },

            eventNamespace = options.pluginName,

            eventInNamespace = function(eventName) {
                return eventNamespace + "." + eventName;
            },

            // Plugin functions expect to be executed in a deck context
            // Mimicing, and extending,the internal createEventData bespoke uses
            createEventData = function(deck, eventNamespace, eventName, innerEvent, slide, eventData) {
                eventData = eventData || {};

                eventData.eventNamespace = eventNamespace || null;

                eventData.eventName = eventName || null;

                // Can be either a DOM/browser event or a bespoke event
                eventData.innerEvent = innerEvent || null;

                if (isNumber(slide)) {
                    eventData.index = slide;
                    eventData.slide = deck.slides[slide];
                } else {
                    eventData.index = deck.slides.indexOf(slide);
                    eventData.slide = slide;
                }

                return eventData;
            },

            // TODO: create a second object bound to both this external object and the deck,
            // to avoid passing the deck parameter every time. (Which can be alleviated with simpler function binding though.)
            fire = function(deck, eventName, innerEvent, slide, customData) {
                return deck.fire(eventInNamespace(eventName), createEventData(deck, eventNamespace, eventName, innerEvent, slide, customData));
            },

            copyArray = function(arr) {
                return [].slice.call(arr, 0);
            },

            log = function() {
                var prefixes = [tag];

                // global.convenientOptions.logger.log is dynamic, so can't bind directly to it
                global.convenientOptions.logger.log.apply(global.convenientOptions.logger.log, prefixes.concat(copyArray(arguments)));
            },

            checkIfPluginWasAlreadyLoaded = function() {
                if (ns[options.pluginName] !== undefined) {
                    throw cv.generateErrorObject("The " + options.pluginName + " plugin has already been loaded, can't load it twice.");
                }
            },

            checkIfDependenciesHaveBeenLoaded = function() {
                if (Array.isArray(options.dependencies)) {
                    options.dependencies.forEach(function(dependency) {
                        if (ns[dependency] === undefined) {
                            throw cv.generateErrorObject("The " + options.pluginName + " plugin requires the " + dependency + " plugin to be loaded.");
                        }
                    });
                }
            },

            init = function() {
                checkIfPluginWasAlreadyLoaded();
                checkIfDependenciesHaveBeenLoaded();

                external.createEventData = createEventData.bind(this);
                external.generateErrorObject = generateErrorObject.bind(this);
                external.fire = fire.bind(this);
                external.copyArray = copyArray.bind(this);
                external.log = log.bind(this);
                external.getStorage = plugin.getDeckPluginStorage.bind(this, pluginName);
            };

        init();

        return external;
    };

    plugin.getDeckStorage = function(deck) {
        if (deck === undefined) {
            throw cv.generateErrorObject("deck must be defined.");
        }

        var storage = null;

        decksStorages.forEach(function(deckStorage) {
            if (deckStorage.deck === deck) {
                storage = deckStorage.storage;
                return false;
            }
        });

        return storage;
    };

    plugin.getDeckPluginStorage = function(pluginName, deck) {
        if (pluginName === undefined) {
            throw cv.generateErrorObject("pluginName must be defined.");
        }

        var storage = plugin.getDeckStorage(deck);

        if (storage[pluginName] === undefined) {
            storage[pluginName] = {};
        }

        return storage[pluginName];
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

    init();

    ns[pluginName] = plugin;
}(this, console, Math, bespoke, bespoke.plugins, "convenient"));
