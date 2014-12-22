/*global require:true, document:true, jasmine:true, describe:true, it:true, expect:true, beforeEach:true, spyOn:true */

// TODO: Test bespoke's browser global 'bespoke.plugins.convenient()' mode.

Function.prototype.bind = Function.prototype.bind || require("function-bind");

var bespoke = require("bespoke"),
    convenient = require("../../lib-instrumented/bespoke-convenient.js"),
    browserGlobal = (function(f) {
        return f("return this")();
    }(Function));

(function(browserGlobal, document, jasmine, bespoke, describe, it, expect, beforeEach, spyOn, undefined) {
    "use strict";

    describe("bespoke-convenient", function() {

        var deck,

            createDeck = function() {
                var parent = document.createElement("article");
                for (var i = 0; i < 10; i++) {
                    parent.appendChild(document.createElement("section"));
                }

                deck = bespoke.from(parent);
            },

            cv,

            somePluginName = "somePluginName",

            noop = function() {},

            emptyPluginMethod = noop,

            cvBoundToDeck;

        describe("cv.builder simple options", function() {
            var createConvenient = function() {
                cv = convenient.builder(somePluginName);
            };

            beforeEach(createConvenient);

            describe("cv.createEventData", function() {
                beforeEach(createDeck);

                var eventNamespace = "spec",
                    eventName = "createEventData";

                it("should have an index property when initalized with a slide object", function() {
                    var index = 3,
                        slide = deck.slides[index],
                        eventData = cv.createEventData(deck, eventNamespace, eventName, null, slide);

                    expect(eventData.index).toBe(index);
                    expect(eventData.slide).toBe(slide);
                });

                it("should have a slide property when initalized with a slide index", function() {
                    var index = 3,
                        slide = deck.slides[index],
                        eventData = cv.createEventData(deck, eventNamespace, eventName, null, index);

                    expect(eventData.index).toBe(index);
                    expect(eventData.slide).toBe(slide);
                });

                it("should have a slide property when initalized with a slide index for bound method", function() {
                    var index = 3,
                        slide = deck.slides[index],
                        eventData;

                    cvBoundToDeck = cv.activateDeck(deck);
                    eventData = cvBoundToDeck.createEventData(eventNamespace, eventName, null, index);

                    expect(eventData.index).toBe(index);
                    expect(eventData.slide).toBe(slide);
                });
            });

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

                it("should fire events prefixed with the plugin name for the bound method", function() {
                    var eventListener = jasmine.createSpy("eventListener"),
                        off = deck.on(someNamespacedEventName, eventListener);

                    cvBoundToDeck = cv.activateDeck(deck);
                    cvBoundToDeck.fire(someEventName);
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

            describe("cv.log", function() {
                var internalLogger = browserGlobal.convenientOptions.logger,

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

            describe("cv.activateDeck", function() {
                beforeEach(createDeck);

                it("should work once for a deck", function() {
                    cvBoundToDeck = cv.activateDeck(deck);
                });

                it("should not work for already activated decks", function() {
                    cvBoundToDeck = cv.activateDeck(deck);

                    expect(function() {
                        cvBoundToDeck = cv.activateDeck(deck);
                    }).toThrow();
                });

                it("should fail for null decks", function() {
                    expect(function() {
                        cvBoundToDeck = cv.activateDeck(null);
                    }).toThrow();
                });

                it("should return bound methods", function() {
                    cvBoundToDeck = cv.activateDeck(deck);

                    expect(typeof cvBoundToDeck.createEventData).toEqual("function")
                    expect(typeof cvBoundToDeck.fire).toEqual("function")
                    expect(typeof cvBoundToDeck.getStorage).toEqual("function")
                });
            });

            describe("cv.getStorage", function() {
                beforeEach(createDeck);

                it("should not work for unactivated decks", function() {
                    expect(function() {
                        cv.getStorage(deck);
                    }).toThrow();
                });

                it("should work from cv", function() {
                    var storage;

                    // Simulate a plugin activating the deck
                    cvBoundToDeck = cv.activateDeck(deck);

                    storage = cv.getStorage(deck);

                    expect(storage).toEqual({});
                });

                it("should fail for null deck", function() {
                    var storage;

                    // Simulate a plugin activating the deck
                    cvBoundToDeck = cv.activateDeck(deck);

                    expect(function() {
                        storage = cv.getStorage(null);
                    }).toThrow();
                });

                it("should be empty to start with", function() {
                    var storage;

                    // Simulate a plugin activating the deck
                    cvBoundToDeck = cv.activateDeck(deck);

                    storage = cvBoundToDeck.getStorage();

                    expect(storage).toEqual({});
                });

                it("should be able to store, then retrieve, data", function() {
                    var storage1,
                        storage2 = null,
                        data = {
                            things: "asdf"
                        };

                    // Simulate a plugin activating the deck
                    cvBoundToDeck = cv.activateDeck(deck);

                    storage1 = cvBoundToDeck.getStorage();

                    expect(storage1.whatever).toBe(undefined);
                    storage1.whatever = data;
                    storage2 = cvBoundToDeck.getStorage();
                    expect(storage2.whatever).toBe(data);
                });
            });
        });

        describe("convenient.copyArray", function() {
            it("should copy an empty array", function() {
                var array = [],
                    copy = convenient.copyArray(array);

                expect(array.length).toBe(copy.length);
            });

            it("should copy an array with elements", function() {
                var array = ["stuff"],
                    copy = convenient.copyArray(array);

                expect(array.length).toBe(copy.length);
                expect(array[0]).toBe(copy[0]);
            });
        });

        describe("convenient.getDeckStorage", function() {
            it("should fail for null deck", function() {
                expect(function() {
                    var storage = convenient.getDeckStorage(null);
                }).toThrow();
            });
        });

        describe("convenient.getDeckPluginStorage", function() {
            it("should fail for null pluginName", function() {
                expect(function() {
                    var storage = convenient.getDeckPluginStorage(null, null);
                }).toThrow();
            });
        });

        describe("convenient.getDeckPluginStorage", function() {
            it("should fail for null deck", function() {
                expect(function() {
                    var storage = convenient.getDeckPluginStorage(somePluginName, null);
                }).toThrow();
            });
        });

        describe("convenient.createEventData", function() {
            var createConvenient = function() {
                cv = convenient.builder(somePluginName);
            };

            beforeEach(createConvenient);

            describe("calling with deck context", function() {
                beforeEach(createDeck);

                var eventNamespace = "spec",
                    eventName = "createEventData";

                it("should have an index property when initalized with a slide object", function() {
                    var index = 3,
                        slide = deck.slides[index],
                        eventData = convenient.createEventData.call(deck, eventNamespace, eventName, null, slide);

                    expect(eventData.index).toBe(index);
                    expect(eventData.slide).toBe(slide);
                });

                it("should have a slide property when initalized with a slide index", function() {
                    var index = 3,
                        slide = deck.slides[index],
                        eventData = convenient.createEventData.call(deck, eventNamespace, eventName, null, index);

                    expect(eventData.index).toBe(index);
                    expect(eventData.slide).toBe(slide);
                });
            });
        });

        describe("cv.builder advanced options", function() {
            describe("options.pluginName", function() {
                var createConvenient = function() {
                    cv = convenient.builder({
                        pluginName: somePluginName
                    });
                };

                beforeEach(createConvenient);

                describe("cv.generateErrorObject", function() {
                    it("should create an error with a message that contains the plugin name", function() {
                        var customMessage = "",
                            error = cv.generateErrorObject(customMessage);

                        expect(error.message).toContain(somePluginName);
                    });
                });
            });


            describe("malformed plugin name", function() {
                describe("pluginName", function() {
                    it("should fail on null pluginName", function() {
                        expect(function() {
                            cv = convenient.builder(null);
                        }).toThrow();
                    });
                });

                describe("options.pluginName", function() {
                    it("should fail on null options.pluginName", function() {
                        expect(function() {
                            cv = convenient.builder({
                                pluginName: null
                            });
                        }).toThrow();
                    });
                });
            });
        });
    });
}(browserGlobal, document, jasmine, bespoke, describe, it, expect, beforeEach, spyOn));
