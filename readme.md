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

I will include unit tests with help of [QUnit](https://qunitjs.com).


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
