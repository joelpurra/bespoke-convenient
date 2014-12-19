/*global module:true, console:true */

"use strict";

var pluginName = "convenient",
    browserGlobal = (function(f) {
        return f("return this")();
    })(Function),

    cv,

    // The defaults object is passed as a reference, and can be modified by browserGlobal.convenientInit
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
        merged.logger.log = (browserGlobal.convenientOptions && browserGlobal.convenientOptions.logger && browserGlobal.convenientOptions.logger.log) || defaults.logger.log;

        browserGlobal.convenientOptions = merged;
    },

    plugin = {},

    decksStorages = [],

    isStorageAlreadyInitiatedForDeck = function(deck) {
        if (!deck) {
            throw cv.generateErrorObject("deck must be defined.");
        }

        var deckAlreadyStored = decksStorages.some(function(deckStorage) {
            return deckStorage.deck === deck;
        });

        return deckAlreadyStored;
    },

    storeDeck = function(deck) {
        var deckAlreadyStored = isStorageAlreadyInitiatedForDeck(deck);

        if (!deckAlreadyStored) {
            decksStorages.push({
                deck: deck,
                storage: {}
            });
        }
    },

    isStorageAlreadyInitiatedForDeckAndPlugin = function(pluginName, deck) {
        if (!pluginName) {
            throw cv.generateErrorObject("pluginName must be defined.");
        }

        if (!deck) {
            throw cv.generateErrorObject("deck must be defined.");
        }

        var storage = plugin.getDeckStorage(deck),
            isStorageInitiated = !!(storage && storage[pluginName]);

        return isStorageInitiated;
    },

    initiateDeckPluginStorage = function(pluginName, deck) {
        if (!pluginName) {
            throw cv.generateErrorObject("pluginName must be defined.");
        }

        if (!deck) {
            throw cv.generateErrorObject("deck must be defined.");
        }

        var storage = plugin.getDeckStorage(deck);

        if (!storage) {
            storeDeck(deck);
            storage = plugin.getDeckStorage(deck);
        }

        storage[pluginName] = {};
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
    if (!options) {
        throw cv.generateErrorObject("The plugin options were not properly defined.");
    }

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
            var result = plugin.createEventData.call(deck, eventNamespace, eventName, innerEvent, slide, eventData);

            return result;
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

            // browserGlobal.convenientOptions.logger.log is dynamic, so can't bind directly to it
            browserGlobal.convenientOptions.logger.log.apply(browserGlobal.convenientOptions.logger.log, prefixes.concat(copyArray(arguments)));
        },

        throwIfPluginWasAlreadyInitiatedForDeck = function(deck) {
            var isStorageInitiated = isStorageAlreadyInitiatedForDeckAndPlugin(options.pluginName, deck);

            if (isStorageInitiated) {
                throw cv.generateErrorObject("The '" + options.pluginName + "' plugin has already been activated for this deck, can't activate it twice.");
            }
        },

        activateDeck = function(deck) {
            throwIfPluginWasAlreadyInitiatedForDeck(deck);
            initiateDeckPluginStorage(options.pluginName, deck);
        },

        bindExternal = function() {
            external.createEventData = createEventData.bind(this);
            external.generateErrorObject = generateErrorObject.bind(this);
            external.fire = fire.bind(this);
            external.copyArray = copyArray.bind(this);
            external.log = log.bind(this);
            external.activateDeck = activateDeck.bind(this);
            external.getStorage = plugin.getDeckPluginStorage.bind(this, options.pluginName);
        },

        init = function() {
            bindExternal();
        };

    init();

    return external;
};

plugin.getDeckStorage = function(deck) {
    if (!deck) {
        throw cv.generateErrorObject("deck must be defined.");
    }

    var storage = null;

    decksStorages.some(function(deckStorage) {
        if (deckStorage.deck === deck) {
            storage = deckStorage.storage;
            return true;
        }

        return false;
    });

    return storage;
};

plugin.getDeckPluginStorage = function(pluginName, deck) {
    if (!pluginName) {
        throw cv.generateErrorObject("pluginName must be defined.");
    }

    if (!deck) {
        throw cv.generateErrorObject("deck must be defined.");
    }

    var storage = plugin.getDeckStorage(deck);

    if (!storage) {
        throw cv.generateErrorObject("storage was not initiated for this deck.");
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

module.exports = plugin;
