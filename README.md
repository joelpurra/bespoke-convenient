[![Build Status](https://secure.travis-ci.org/joelpurra/bespoke-convenient.png?branch=master)](https://travis-ci.org/joelpurra/bespoke-convenient) [![Coverage Status](https://coveralls.io/repos/joelpurra/bespoke-convenient/badge.png)](https://coveralls.io/r/joelpurra/bespoke-convenient)

# [bespoke-convenient](https://github.com/joelpurra/bespoke-convenient)

**Check out the [presentation/demo.](https://joelpurra.github.io/bespoke-convenient/demo/)**

Convenient extension methods for building [Bespoke.js][bespoke.js] plugins. This plugin is targeted towards plugin developers, not everyday bespoke users looking to make a nice presentation.

## Download

Download the [production version][min] or the [development version][max], or use a [package manager](#package-managers).

[min]: https://raw.github.com/joelpurra/bespoke-convenient/master/dist/bespoke-convenient.min.js
[max]: https://raw.github.com/joelpurra/bespoke-convenient/master/dist/bespoke-convenient.js

## Usage

This plugin is shipped in a [UMD format](https://github.com/umdjs/umd), meaning that it is available as a CommonJS/AMD module or browser global.

For example, when using CommonJS modules:

```js
var bespoke = require('bespoke'),
  convenient = require('bespoke-convenient');

var cv = convenient.builder("myplugin");
```

When using browser globals:

```js
var cv = bespoke.plugins.convenient.builder("myplugin");
```

Since this is a plugin written for other bespoke plugin developers, have a look at the source files to learn more.

```js
// convenient.builder(pluginName)
// bespoke.plugins.convenient.builder(pluginName)
// Convenient plugin level functions - create the variable cv in your plugin.
var cv = convenient.builder("myplugin");

// cv.activateDeck(deck)
// Activate convenient features and return an object with functions bound to the deck.
var cvBoundToDeck = cv.activateDeck(deck);

// cv.getStorage(deck)
// cvBoundToDeck.getStorage()
// Get a plugin storage object for the deck. Prior deck activation is required.
// Useful if you store state per deck, not for the entire plugin.
var storage = cvBoundToDeck.getStorage();
storage.anything = "Here you can save any options and state for this particular deck.";
storage.whatever = { happens: "happens" };

// cv.generateErrorObject(message)
// An error object with a prefixed error message.
throw cv.generateErrorObject("Look, sometimes bad things happen, and there is nothing you can do about it, so why worry? -- Simba, The Lion King");

// cv.fire(deck, eventName, innerEvent, slide, customData)
// cvBoundToDeck.fire(eventName, innerEvent, slide, customData)
// Fire an event on the deck, with plugin name etcetera filled in.
// innerEvent: either a DOM/browser event or a bespoke event
// slide: either the index of the affected slide, or the slide object itself
var success = cvBoundToDeck.fire("myevent", e, 123, { someExtraPluginData: "data value", somePluginStatus: 999 });

// cv.createEventData(deck, eventNamespace, eventName, innerEvent, slide, eventData)
// cvBoundToDeck.createEventData(eventNamespace, eventName, innerEvent, slide, eventData)
// Creates the event same object used by cvBoundToDeck.fire(...).
var eventData = cvBoundToDeck.createEventData();

// convenient.copyArray(array)
// Mostly useful for function arguments
var args = convenient.copyArray(arguments);

// cv.log([object], ...)
// Log a prefixed log message, by default to the developer console
cv.log("Something", "happened", 1974);
```


## Package managers

### npm

```bash
$ npm install bespoke-convenient
```

### Bower

```bash
$ bower install bespoke-convenient
```

## TODO

- Move more shared functionality into this plugin.


## Credits

[Mark Dalgleish](http://markdalgleish.com/) for [bespoke.js][bespoke.js] and related tools. This plugin was built with [generator-bespokeplugin](https://github.com/markdalgleish/generator-bespokeplugin).

AJ Batac, [ajbatac on flickr](https://secure.flickr.com/photos/ajbatac/), for his photo [E-Mart Convenience Store](https://secure.flickr.com/photos/ajbatac/7139837787/) ([CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)).



## License

Copyright (c) 2013, 2014, [Joel Purra](http://joelpurra.com/) All rights reserved.

When using bespoke-convenient, comply to the [MIT license](http://joelpurra.mit-license.org/2013-2014). Please see the LICENSE file for details, and the [MIT License on Wikipedia](http://en.wikipedia.org/wiki/MIT_License).

[bespoke.js]: https://github.com/markdalgleish/bespoke.js
