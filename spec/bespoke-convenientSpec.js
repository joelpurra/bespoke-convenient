/*global document:true, jasmine:true, bespoke:true, describe:true, it:true, expect:true, beforeEach:true, spyOn:true */

(function(global, document, jasmine, bespoke, describe, it, expect, beforeEach, spyOn) {
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
            },

            cv,

            somePluginName = "somePluginName",

            createConvenient = function() {
                cv = bespoke.plugins.convenient.builder(somePluginName);
            };

        describe("cv.builder", function() {
            beforeEach(createConvenient);

            describe("cv.fire", function() {
                beforeEach(createDeck);

                var someEventName = "someEventName",
                    someNamespacedEventName = somePluginName + "." + someEventName;

                it("should fire events prefixed with the plugin name", function() {
                    var eventListener = jasmine.createSpy("eventListener"),
                        off = deck.on(someNamespacedEventName, eventListener);
                    cv.fire(deck, someEventName);
                    off();
                    expect(eventListener).toHaveBeenCalled();
                });
            });

            describe("cv.generateErrorObject", function() {
                it("should create an error with a message that contains the plugin name and a custom message", function() {
                    var customMessage = "some custom message",
                        error = cv.generateErrorObject(customMessage);

                    expect(error.message).toContain(somePluginName);
                    expect(error.message).toContain(customMessage);
                });
            });

            describe("cv.copyArray", function() {
                it("should copy an empty array", function() {
                    var array = [],
                        copy = cv.copyArray(array);

                    expect(array.length).toBe(copy.length);
                });

                it("should copy an array with elements", function() {
                    var array = ["stuff"],
                        copy = cv.copyArray(array);

                    expect(array.length).toBe(copy.length);
                    expect(array[0]).toBe(copy[0]);
                });
            });

            describe("cv.log", function() {
                var internalLogger = global.convenientOptions.logger,

                    replaceLoggerWithSpy = function() {
                        spyOn(internalLogger, "log");
                    };

                beforeEach(replaceLoggerWithSpy);

                it("should log with tag prefix", function() {
                    var tag = "bespoke." + somePluginName,
                        somethingToLog = "something to log",
                        otherThingToLog = 99999;
                    cv.log(somethingToLog, otherThingToLog);
                    expect(internalLogger.log).toHaveBeenCalledWith(tag, somethingToLog, otherThingToLog);
                });
            });
        });

        describe("deck functionality", function() {
            beforeEach(createDeck);

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
    });
}(this, document, jasmine, bespoke, describe, it, expect, beforeEach, spyOn));
