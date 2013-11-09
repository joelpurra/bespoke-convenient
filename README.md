[![Build Status](https://secure.travis-ci.org/joelpurra/bespoke-convenient.png?branch=master)](https://travis-ci.org/joelpurra/bespoke-convenient)

# bespoke-convenient

Convenient extension methods for building [Bespoke.js][bespoke.js] plugins. This plugin is targeted towards plugin developers, not everyday bespoke users looking to make a nice presentation.

## Download

Download the [production version][min] or the [development version][max], or use a [package manager](#package-managers).

[min]: https://raw.github.com/joelpurra/bespoke-convenient/master/dist/bespoke-convenient.min.js
[max]: https://raw.github.com/joelpurra/bespoke-convenient/master/dist/bespoke-convenient.js

## Usage

First, include both `bespoke.js` and `bespoke-convenient.js` in your page.

Then, simply include the plugin when instantiating your presentation - and make sure to insert `convenient: true` before any other plugin that might use convenient.

```js
bespoke.horizontal.from('article', {
  convenient: true
});
```

Since this is a plugin written for other bespoke plugin developers, have a look at the source files.

```js
// bespoke.plugins.convenient.builder(pluginName)
// Convenient plugin level functions - create the variable cv in your plugin.
var cv = bespoke.plugins.convenient.builder("myplugin");

// cv.generateObject(message)
// An error object with a prefixed error message.
throw cv.generateErrorObject("Look, sometimes bad things happen, and there is nothing you can do about it, so why worry? -- Simba, The Lion King");

// cv.fire(deck, eventName, innerEvent, slide, customData)
// Fire an event on the deck, with plugin name etcetera filled in.
// innerEvent: either a DOM/browser event or a bespoke event
// slide: either the index of the affected slide, or the slide object itself
var success = cv.fire(deck, "myevent", e, 123, { someExtraPluginData: "data value", somePluginStatus: 999 });

// cv.copyArray(array)
// Mostly useful for function arguments
var args = cv.copyArray(arguments);

// cv.log([object], ...)
// Log a prefixed log message, by default to the developer console
cv.log("Something", "happened", 1974);

// deck.createEventData(eventNamespace, eventName, innerEvent, slide, eventData)
// Creates the event same object used by cv.fire(...).
var eventData = deck.createEventData();
```


## Package managers

### Bower

```bash
$ bower install bespoke-convenient
```

### npm

```bash
$ npm install bespoke-convenient
```

The bespoke-convenient npm package is designed for use with [browserify](http://browserify.org/), e.g.

```js
require('bespoke');
require('bespoke-convenient');
```

## TODO

- Move more shared functionality into this plugin.


## Credits

[Mark Dalgleish](http://markdalgleish.com/) for [bespoke.js][bespoke.js] and related tools. This plugin was built with [generator-bespokeplugin](https://github.com/markdalgleish/generator-bespokeplugin).

AJ Batac, [ajbatac on flickr](https://secure.flickr.com/photos/ajbatac/), for his photo [E-Mart Convenience Store](https://secure.flickr.com/photos/ajbatac/7139837787/) ([CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)).



## License

Copyright (c) 2013, [Joel Purra](http://joelpurra.com/) All rights reserved.

When using bespoke-convenient, comply to the [MIT license](http://joelpurra.mit-license.org/2013). Please see the LICENSE file for details, and the [MIT License on Wikipedia](http://en.wikipedia.org/wiki/MIT_License).

[bespoke.js]: https://github.com/markdalgleish/bespoke.js
