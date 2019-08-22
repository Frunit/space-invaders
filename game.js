'use strict';

const debug1 = document.getElementById('debug1');
const debug2 = document.getElementById('debug2');
const debug3 = document.getElementById('debug3');
const debug4 = document.getElementById('debug4');
const debug5 = document.getElementById('debug5');
const debug6 = document.getElementById('debug6');
const debug7 = document.getElementById('debug7');
const debug8 = document.getElementById('debug8');


function Game() {

	this.options = {
		optimal_size: {w: 900, h: 600},
	};

	this.version = 'pre-alpha';

	this.last_time = 0;
	this.last_fps = 0;
	this.frames = 0;
	this.clicked_element = null;
	this.right_clicked_element = null;
	this.engine = null;
	this.gui = null;
}


// The game loop
Game.prototype.loop = function() {
	const now = Date.now();
	const dt = (now - this.last_time) / 1000;

	this.update(dt);
	this.gui.render(this.engine.get_entities());
	this.update_fps(now);

	this.last_time = now;

	requestAnimationFrame(() => this.loop());
};


Game.prototype.update_fps = function(now) {
	// FPS will be shown as 1/s
	this.frames++;
	if(now - this.last_fps > 1000) {
		debug4.value = 'FPS: ' + this.frames;
		this.frames = 0;
		this.last_fps = now;
	}
};


Game.prototype.update = function(dt) {
	this.engine.update(dt);
};


Game.prototype.start = function() {
	this.engine = new Engine();
	this.engine.setup();

	this.gui = new GUI(document.getElementById('game'), this.options.optimal_size);

	this.last_time = Date.now();
	this.loop();
};


const input = new Input();

document.addEventListener('keydown', function(e) {
	input.set_key(e, true);
});

document.addEventListener('keyup', function(e) {
	input.set_key(e, false);
});



const game = new Game();
const resources = new Resources();


resources.on_ready(() => {game.start()});
resources.load([
	'gfx/sprites.png',
]);
