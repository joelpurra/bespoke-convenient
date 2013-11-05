[![Build Status](https://secure.travis-ci.org/joelpurra/bespoke-convenient.png?branch=master)](https://travis-ci.org/joelpurra/bespoke-convenient)

# bespoke-convenient

Convenient extension methods for building [Bespoke.js](http://markdalgleish.com/projects/bespoke.js) plugins

## Download

Download the [production version][min] or the [development version][max], or use a [package manager](#package-managers).

[min]: https://raw.github.com/joelpurra/bespoke-convenient/master/dist/bespoke-convenient.min.js
[max]: https://raw.github.com/joelpurra/bespoke-convenient/master/dist/bespoke-convenient.js

## Usage

First, include both `bespoke.js` and `bespoke-convenient.js` in your page.

Then, simply include the plugin when instantiating your presentation.

```js
bespoke.horizontal.from('article', {
  convenient: true
});
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

## Credits

This plugin was built with [generator-bespokeplugin](https://github.com/markdalgleish/generator-bespokeplugin).

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
