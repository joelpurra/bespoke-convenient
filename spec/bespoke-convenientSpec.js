/*global document:true, jasmine:true, bespoke:true, describe:true, it:true, expect:true, beforeEach:true */

(function(document, jasmine, bespoke, describe, it, expect, beforeEach) {
    "use strict";

    describe("bespoke-convenient", function() {

        var deck,

            createDeck = function() {
                var parent = document.createElement("article");
                for (var i = 0; i < 10; i++) {
                    parent.appendChild(document.createElement("section"));
                }

                deck = bespoke.from(parent, {
                    convenient: true
                });
            };

        beforeEach(createDeck);

        describe("cv.builder", function() {
            var cv,
                somePluginName = "somePluginName",
                someEventName = "someEventName",
                someNamespacedEventName = somePluginName + "." + someEventName,
                customMessage = "some custom message";

            beforeEach(function() {
                cv = bespoke.plugins.convenient.builder(somePluginName);
            });

            it("should fire events prefixed with the plugin name", function() {
                var eventListener = jasmine.createSpy("eventListener"),
                    off = deck.on(someNamespacedEventName, eventListener);
                cv.fire(deck, someEventName);
                off();
                expect(eventListener).toHaveBeenCalled();
            });

            it("should create an error with a message that contains the plugin name and a custom message", function() {
                var error = cv.generateErrorObject(customMessage);

                expect(error.message).toContain(somePluginName);
                expect(error.message).toContain(customMessage);
            });
        });

        describe("deck.createEventData", function() {
            var eventNamespace = "spec",
                eventName = "createEventData";

            it("should have an index property when initalized with a slide object", function() {
                var index = 3,
                    slide = deck.slides[index],
                    eventData = deck.createEventData(eventNamespace, eventName, null, slide);

                expect(eventData.index).toBe(index);
                expect(eventData.slide).toBe(slide);
            });

            it("should have a slide property when initalized with a slide index", function() {
                var index = 3,
                    slide = deck.slides[index],
                    eventData = deck.createEventData(eventNamespace, eventName, null, index);

                expect(eventData.index).toBe(index);
                expect(eventData.slide).toBe(slide);
            });
        });
    });
}(document, jasmine, bespoke, describe, it, expect, beforeEach));
