Space Invaders
==============

**master**: [![Build Status](https://travis-ci.com/Frunit/space-invaders.svg?branch=master)](https://travis-ci.com/Frunit/space-invaders)

**dev**: [![Build Status](https://travis-ci.com/Frunit/space-invaders.svg?branch=dev)](https://travis-ci.com/Frunit/space-invaders)

Space Invaders is a game written by Mathias Bockwoldt in Javascript
(ECMAScript 2018) without any frameworks for the
[it-talents.de competition September 2019](https://www.it-talents.de/foerderung/code-competition/airbus-code-competition-09-2019)
sponsored by Airbus.

The latest version on the master branch can be played here: [frunit.github.io/space-invaders](https://frunit.github.io/space-invaders)


Features
--------

The classical alien monsters once again attack from above and *you* have to
defend planet Earth. You may play alone or ask a friend to control a second
fighter.

There are two major differences to the original game. There are several different
levels. If you manage to beat the all, the first level will load again, but with
more difficul enemies! Also, enemies have a certain chance to drop goodies (or
power-ups) that will improve your fighter for a few seconds. But beware of the
dangerous fake goody that will kill you!

The game needs a keyboard, so it will not work on touch-only devices!


Programmatic organisation
-------------------------

The game is written in an object-oriented way. The master game object handles a
screen and the current stage. The stages should work without any screen,
modifying objects following certain rules. The objects can be sent to the screen
for rendering. The stages are:
- `start` - The start display
- `engine` - The actual game
- `highscore` - The highscore

The game has two global objects, that are:
- `game`: The actual game, holding the engine and the screen.
- `resources`: Organizes graphics used by the screen. This is defined globally
    to be able to load graphics before the game is initialized.


Source documentation
--------------------

The source code documentation is compatible with [JSDoc](https://jsdoc.app).
After installation of JSDoc, you can build the documentation using:

```sh
jsdoc . --readme readme.md
```

The documentation root will be in the file `./out/index.html`.


Testing
-------

Apparently, automatic testing of a Javascript game ment for the browser is difficult.
I tried to separated browser-specific code as much as possible from browser-
independet stuff. The independent things can be tested automatically in node.js.
For this, I use [QUnit](https://qunitjs.com). QUnit can in principle also test
browser content, but this doesn't work automatically but involves the user
opening a specially prepared test page. This, in turn, might be possible using a
headless browser with some modifications, but that was too much effort for this
competition project.

Due to these limitations, `Screen` and `Input` are not covered by
tests. I created "fake" classes to replace these two classes as closely as
possible in the tests. The class to import is chosen automatically at runtime
depending on the presence of the `window` object (which is only present in
browsers).

For testing, you need the following (assuming that an up-to-date version of
node.js and npm are installed):

```sh
npm install --save-dev qunit
npm install --save-dev esm
node -r esm $(which qunit)
```

The last line is so quirky, because node does not understand ECMA 2016 `import`
statement. These need to be loaded by the `esm` module and then, qunit must be
started with `esm` active. Very annoying! Maybe it will work out of the box in a
few years.

TravisCI also runs a code linter, ESLint, as a kind of simple static code
analyser. You can install all necessary packages with:

```sh
npm install --save-dev eslint
npm install --save-dev eslint-plugin-jsdoc
eslint --global resources *.js
```

`resources` must be defined as global to prevent errors from ESLint not
recognizing the global variable.


Issues, bugs, proposals, and things to do
-----------------------------------------

Issues, bugs, and proposals can be sent using the
[Github issue tracker](https://github.com/Frunit/space-invaders/issues)

I don't keep a central to-do list, but write them as comments directly into the
files. On Linux, you can retrieve them using `grep`.

```sh
grep TODO *.js   # These are *must* to-dos
grep MAYBE *.js  # These are features I might include later
```
