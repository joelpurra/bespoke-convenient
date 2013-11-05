/*global Math:true, bespoke:true */

(function(Math, bespoke, ns, pluginName, undefined) {
    "use strict";

    var tag = "bespoke." + pluginName,

        generateErrorObject = function(message) {
            return new Error(tag + ": " + message);
        },

        eventNamespace = pluginName,

        eventInNamespace = function(eventName) {
            return eventNamespace + "." + eventName;
        },

        plugin = function self(deck) {
            deck.firstIndex = self.firstIndex.bind(deck);
            deck.lastIndex = self.lastIndex.bind(deck);
            deck.first = self.first.bind(deck);
            deck.last = self.last.bind(deck);
            deck.createEventData = self.createEventData.bind(deck);
        },

        isNumber = function(n) {
            // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
            // From http://stackoverflow.com/a/1830844
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        internalFire = function(deck, eventName, innerEvent, index, customData) {
            return deck.fire(eventInNamespace(eventName), deck.createEventData(eventNamespace, eventName, innerEvent, index, customData));
        };

    // Plugin functions expect to be executed in a deck context
    plugin.firstIndex = function() {
        var index = 0;

        return index;
    };

    plugin.lastIndex = function() {
        var index = Math.max(0, this.slides.length - 1);

        return index;
    };

    plugin.first = function(customData) {
        var index = this.firstIndex(),
            result = internalFire(this, "first", null, index, customData) && this.slide(index, customData);

        return result;
    };

    plugin.last = function(customData) {
        var index = this.lastIndex(),
            result = internalFire(this, "last", null, index, customData) && this.slide(index, customData);

        return result;
    };

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

    if (ns[pluginName] !== undefined) {
        throw generateErrorObject("The " + pluginName + " plugin has already been loaded.");
    }

    ns[pluginName] = plugin;
}(Math, bespoke, bespoke.plugins, "convenient"));
