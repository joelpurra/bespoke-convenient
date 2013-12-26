/*global console:true, bespoke:true */

(function(global, console, bespoke, ns, pluginName, undefined) {
    "use strict";

    var cv,

        // This is the default for a plugin that is activated for a deck, and no particular options are passed.
        defaultPluginActivationOptions = true,

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
            merged.logger.log = (global.convenientOptions && global.convenientOptions.logger && global.convenientOptions.logger.log) || defaults.logger.log;

            global.convenientOptions = merged;
        },

        pluginOptions = {},

        decksStorages = [],

        storeDeck = function(deck) {
            if (!decksStorages.some(function(deckStorage) {
                return deckStorage.deck === deck;
            })) {
                decksStorages.push({
                    deck: deck,
                    storage: {}
                });
            }
        },

        plugin = function() {},

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

        options.dependencies = options.dependencies || [];

        pluginOptions[options.pluginName] = options;

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
                options.dependencies.forEach(function(dependency) {
                    if (ns[dependency] === undefined) {
                        throw cv.generateErrorObject("The " + options.pluginName + " plugin requires the " + dependency + " plugin to be loaded.");
                    }
                });
            },

            prepareDeckDependencyCheck = function(deck) {
                var storage = cv.getStorage(deck);

                storage.activatedPlugins = storage.activatedPlugins || [];
            },

            activatePluginForDeck = function(pluginNameToActivate, deck) {
                var storage = cv.getStorage(deck);

                // TODO: perform this activation/load order check at load instead?
                if (storage.activatedPlugins.indexOf(pluginNameToActivate) !== -1) {
                    cv.log("The " + pluginNameToActivate + " plugin has already been activated for this deck, can't activate it twice. This might indicate a circular plugin dependency, but dependency graph traversal hasn't been implemented into convenient, so maybe not.");
                } else {
                    bespoke.plugins[pluginNameToActivate](deck, defaultPluginActivationOptions);

                    storage.activatedPlugins.push(pluginNameToActivate);
                }
            },

            activateDependenciesForDeck = function(pluginNameToActivateDependenciesFor, deck) {
                var storage = cv.getStorage(deck),
                    dependencyOptions = pluginOptions[pluginNameToActivateDependenciesFor];

                // Only check for dependencies for plugins convenient knows about
                if (dependencyOptions) {
                    dependencyOptions.dependencies.forEach(function(dependency) {
                        if (storage.activatedPlugins.indexOf(dependency) === -1) {
                            activatePluginForDeck(dependency, deck);
                            activateDependenciesForDeck(dependency, deck);
                        }
                    });
                }

                storage.activatedPlugins.push(pluginNameToActivateDependenciesFor);
            },

            activateDeck = function(deck) {
                storeDeck(deck);
                prepareDeckDependencyCheck(deck);
                activateDependenciesForDeck(options.pluginName, deck);
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
                checkIfPluginWasAlreadyLoaded();
                checkIfDependenciesHaveBeenLoaded();
                bindExternal();
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
}(this, console, bespoke, bespoke.plugins, "convenient"));
