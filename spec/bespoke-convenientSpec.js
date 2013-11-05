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

        describe("deck.firstIndex", function() {
            it("should always return 0", function() {
                expect(deck.firstIndex()).toBe(0);
            });
        });

        describe("deck.lastIndex", function() {
            it("should return the index of the last slide", function() {
                expect(deck.lastIndex()).toBe(9);
            });
        });

        describe("deck.first", function() {
            beforeEach(function() {
                deck.slide(5);
            });

            it("should go to first slide", function() {
                expect(deck.slides[5].classList.contains("bespoke-active")).toBe(true);
                deck.first();
                expect(deck.slides[0].classList.contains("bespoke-active")).toBe(true);
            });

            it("should fire first event", function() {
                var eventListener = jasmine.createSpy("eventListener"),
                    off = deck.on("convenient.first", eventListener);
                deck.first();
                expect(eventListener).toHaveBeenCalled();
                off();
            });
        });

        describe("deck.last", function() {
            beforeEach(function() {
                deck.slide(5);
            });

            it("should go to last slide", function() {
                expect(deck.slides[5].classList.contains("bespoke-active")).toBe(true);
                deck.last();
                expect(deck.slides[9].classList.contains("bespoke-active")).toBe(true);
            });

            it("should fire last event", function() {
                var eventListener = jasmine.createSpy("eventListener"),
                    off = deck.on("convenient.last", eventListener);
                deck.last();
                expect(eventListener).toHaveBeenCalled();
                off();
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
