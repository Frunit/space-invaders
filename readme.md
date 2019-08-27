Space Invaders
==============

Space Invaders is a game written in Javascript (ECMA 2015+) without any
frameworks for the
[it-talents.de competition September 2019](https://www.it-talents.de/foerderung/code-competition/airbus-code-competition-09-2019)
sponsored by Airbus.


Features
--------

Besides the classical alien monsters that slowly attack from above and the
brave fighter controlled by the player, I added some features inspired by
another classic, [Break Out](https://en.wikipedia.org/wiki/Breakout_(video_game)),
specifically by the version on the [Atari ST](https://en.wikipedia.org/wiki/Atari_ST).
After shooting down a monster, there is a certain chance for a power-up
appearing. If the player manages to collect it, the fighter will get an
advantage, like a ball that can be controlled just as in *Break Out* to take out
the monsters.


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

Automatic testing of a Javascript game ment for the browser is apparently hard.
I tried to separated browser-specific stuff as much as possible from browser-
independet stuff. The independent things can be tested automatically in node.js.
For this, I use [QUnit](https://qunitjs.com). QUnit can in principle also test
browser content, but this doesn't work automatically but involves the user
opening a specially prepared test page. This in turn might be possible using a
headless browser with some modifications, but that was too much effort for this
competition project.

Due to these limitations, `GUI`, `Input`, and `Resources` are not covered by
tests. I created "fake" classes to replace these three classes as closely as
possible in the tests. The class to import is chosen automatically at runtime
depending on the presence of the `window` object (which is only present in
browsers).

For testing, you need the following (assuming that an up-to-date version of
node.js and npm are installed):

```sh
npm install --global qunit  # Of course, you may install it locally as well
npm install --save esm
node -r esm $(which qunit)
```

The last line is so quirky, because node does not understand ECMA 2016 `import`
statement. These need to be loaded by the `esm` module and then, qunit must be
started with `esm` active. Very annoying! Maybe it works out of the box in a few
years.


Programmatic organisation
-------------------------

The game is written in an object-oriented way. The master game object handles
an engine and a graphical user interface (gui). The engine should work without
any gui, modifying objects following certain rules. The objects can be sent to
the gui for rendering.

The game has three global objects, that are:
- `game`: The actual game, holding the engine and the gui.
- `input`: Organizes key presses that can be pulled by the game.
- `resources`: Organizes graphics used by the gui. This is defined globally
    to be able to load graphics before the game is initialized.

In addition, there are four debugging outputs (in addition to the omnipresent
`console`), `debug1` through `debug4` that represent input fields to write
quickly changing values that would spam the console too much. The debug
outputs will be removed when the game is published. `debug4` will show the
current frames per second.


Issues, bugs, proposals, and things to do
-----------------------------------------

Issues, bugs, and proposals can be send using the
[Github issue tracker](https://github.com/Frunit/space-invaders/issues)

I don't keep a central to-do list, but write them as comments directly into the
files. On Linux, you can retrieve them using `grep`.

```sh
grep TODO *.js
```
