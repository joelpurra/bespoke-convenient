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

                deck = bespoke.from(parent);
            },

            cv,

            somePluginName = "somePluginName",

            noop = function() {},

            emptyPluginMethod = noop;

        describe("cv.builder simple options", function() {
            var createConvenient = function() {
                cv = bespoke.plugins.convenient.builder(somePluginName);
            };

            beforeEach(createConvenient);

            describe("plugin load protection", function() {
                it("should not be possible to load plugin twice", function() {
                    // Simulating loading the plugin
                    bespoke.plugins[somePluginName] = emptyPluginMethod;

                    // Create another convenient object, based on the same plugin name
                    expect(createConvenient).toThrow();

                    // Simulate not having loaded the plugin at all
                    delete bespoke.plugins[somePluginName];
                });
            });

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

            describe("cv.getStorage", function() {
                beforeEach(createDeck);

                it("should not work for unactivated decks", function() {
                    expect(function() {
                        cv.getStorage(deck);
                    }).toThrow();
                });

                it("should be empty to start with", function() {
                    var storage;

                    // Fake plugin
                    bespoke.plugins[somePluginName] = emptyPluginMethod;

                    // Simulate a plugin activating the deck
                    cv.activateDeck(deck);

                    storage = cv.getStorage(deck);

                    expect(storage).toEqual({});

                    // Delete fake plugin
                    delete bespoke.plugins[somePluginName];
                });

                it("should be able to store, then retrieve, data", function() {
                    var storage1,
                        storage2 = null,
                        data = {
                            things: "asdf"
                        };

                    // Fake plugin
                    bespoke.plugins[somePluginName] = emptyPluginMethod;

                    // Simulate a plugin activating the deck
                    cv.activateDeck(deck);

                    storage1 = cv.getStorage(deck);

                    expect(storage1.whatever).toBe(undefined);
                    storage1.whatever = data;
                    storage2 = cv.getStorage(deck);
                    expect(storage2.whatever).toBe(data);

                    // Delete fake plugin
                    delete bespoke.plugins[somePluginName];
                });
            });
        });

        describe("cv.builder advanced options", function() {
            describe("options.pluginName", function() {
                var createConvenient = function() {
                    cv = bespoke.plugins.convenient.builder({
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

            describe("options.dependencies", function() {
                var someOtherPlugin = "someOtherPlugin";

                describe("at load", function() {
                    it("should allow undefined dependencies", function() {
                        cv = bespoke.plugins.convenient.builder({
                            pluginName: somePluginName,
                            dependencies: undefined
                        });
                    });

                    it("should allow empty dependencies", function() {
                        cv = bespoke.plugins.convenient.builder({
                            pluginName: somePluginName,
                            dependencies: []
                        });
                    });

                    it("should allow defined dependencies", function() {
                        // Fake other plugin
                        bespoke.plugins[someOtherPlugin] = emptyPluginMethod;

                        cv = bespoke.plugins.convenient.builder({
                            pluginName: somePluginName,
                            dependencies: [someOtherPlugin]
                        });

                        // Delete fake other plugin
                        delete bespoke.plugins[someOtherPlugin];
                    });

                    it("should not allow undefined dependencies", function() {
                        expect(function() {
                            cv = bespoke.plugins.convenient.builder({
                                pluginName: somePluginName,
                                dependencies: [someOtherPlugin]
                            });
                        }).toThrow();
                    });
                });

                describe("cv.activateDeck", function() {
                    beforeEach(createDeck);

                    it("should activate a defined dependency", function() {
                        var otherPluginMethod = jasmine.createSpy("otherPluginMethod");

                        // Fake other plugin
                        bespoke.plugins[someOtherPlugin] = otherPluginMethod;

                        cv = bespoke.plugins.convenient.builder({
                            pluginName: somePluginName,
                            dependencies: [someOtherPlugin]
                        });

                        // Fake plugin
                        bespoke.plugins[somePluginName] = emptyPluginMethod;

                        // Simulate a plugin activating the deck
                        cv.activateDeck(deck);

                        expect(otherPluginMethod).toHaveBeenCalledWith(deck, true);
                        expect(otherPluginMethod.callCount).toEqual(1);

                        // Delete fake plugin
                        delete bespoke.plugins[somePluginName];

                        // Delete fake other plugin
                        delete bespoke.plugins[someOtherPlugin];
                    });

                    it("should activate two defined dependencies", function() {
                        var someOtherPlugin2 = "someOtherPlugin2",
                            otherPluginMethod = jasmine.createSpy("otherPluginMethod"),
                            otherPluginMethod2 = jasmine.createSpy("otherPluginMethod2");

                        // Fake other plugins, but don't tell convenient about them
                        bespoke.plugins[someOtherPlugin] = otherPluginMethod;
                        bespoke.plugins[someOtherPlugin2] = otherPluginMethod2;

                        cv = bespoke.plugins.convenient.builder({
                            pluginName: somePluginName,
                            dependencies: [someOtherPlugin, someOtherPlugin2]
                        });

                        // Fake plugin
                        bespoke.plugins[somePluginName] = emptyPluginMethod;

                        // Simulate a plugin activating the deck
                        cv.activateDeck(deck);

                        expect(otherPluginMethod).toHaveBeenCalledWith(deck, true);
                        expect(otherPluginMethod.callCount).toEqual(1);

                        expect(otherPluginMethod2).toHaveBeenCalledWith(deck, true);
                        expect(otherPluginMethod2.callCount).toEqual(1);

                        // Delete fake plugin
                        delete bespoke.plugins[somePluginName];

                        // Delete fake other plugins
                        delete bespoke.plugins[someOtherPlugin];
                        delete bespoke.plugins[someOtherPlugin2];
                    });

                    it("should activate two defined dependencies in hierarchy", function() {
                        var someOtherPlugin2 = "someOtherPlugin2",
                            otherPluginMethod = jasmine.createSpy("otherPluginMethod"),
                            otherPluginMethod2 = jasmine.createSpy("otherPluginMethod2"),
                            cv1;

                        // Fake other plugin 2, but don't tell convenient about it
                        bespoke.plugins[someOtherPlugin2] = otherPluginMethod2;

                        cv1 = bespoke.plugins.convenient.builder({
                            pluginName: someOtherPlugin,
                            dependencies: [someOtherPlugin2]
                        });

                        // Fake other plugin
                        bespoke.plugins[someOtherPlugin] = otherPluginMethod;

                        cv = bespoke.plugins.convenient.builder({
                            pluginName: somePluginName,
                            dependencies: [someOtherPlugin]
                        });

                        // Fake plugin
                        bespoke.plugins[somePluginName] = emptyPluginMethod;

                        // Simulate a plugin activating the deck
                        cv.activateDeck(deck);

                        expect(otherPluginMethod).toHaveBeenCalledWith(deck, true);
                        expect(otherPluginMethod.callCount).toEqual(1);

                        expect(otherPluginMethod2).toHaveBeenCalledWith(deck, true);
                        expect(otherPluginMethod2.callCount).toEqual(1);

                        // Delete fake plugin
                        delete bespoke.plugins[somePluginName];

                        // Delete fake other plugins
                        delete bespoke.plugins[someOtherPlugin];
                        delete bespoke.plugins[someOtherPlugin2];
                    });
                });
            });
        });
    });
}(this, document, jasmine, bespoke, describe, it, expect, beforeEach, spyOn));
