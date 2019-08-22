'use strict';

function Engine() {
	this.enemies = [];
	this.enemy_bullets = [];
	this.player = null;
	this.player_bullets = [];

	this.enemy_direction = -1;
	this.enemy_must_move_down = 0;
}


Engine.prototype.setup = function() {
	this.enemies = [];
	this.enemy_bullets = [];
	this.player = new Player(450, 300);
	this.player_bullets = [];

	this.enemy_direction = -1;
	this.enemy_must_move_down = 0;

	for(let y = 0; y < 5; y++) {
		for(let x = 0; x < 8; x++) {
			const type = Math.ceil(y / 2); // 0, 1, 1, 2, 2, ...
			this.enemies.push(new Enemy(x*50+50, y*50+10, type));
		}
	}
};


Engine.prototype.update = function(dt) {
	this.player.update(dt);

	if(input.is_down('LEFT')) {
		this.player.move(dt * -1, 20, 880);
	}
	else if(input.is_down('RIGHT')) {
		this.player.move(dt, 20, 880);
	}

	if(input.is_down('SPACE')) {
		const bullet = this.player.fire();
		if(bullet !== null) {
			this.player_bullets.push(bullet);
		}
	}

	let direction_has_changed = false;
	let reached_boundary = false

	for(let enemy of this.enemies) {
		if(this.enemy_must_move_down) {
			enemy.update(0, dt, 20, 880, 500);
		}
		else {
			reached_boundary = enemy.update(this.enemy_direction * dt, 0, 20, 880, 500);
		}

		if(reached_boundary && !direction_has_changed) {
			this.enemy_direction *= -1;
			direction_has_changed = true;
		}
	}

	if(this.enemy_must_move_down > 0) {
		this.enemy_must_move_down--;
	}
	else if(direction_has_changed) {
		this.enemy_must_move_down = 10;
	}


	for(let bullet of this.enemy_bullets) {
		bullet.update(dt);
	}

	for(let bullet of this.player_bullets) {
		bullet.update(dt);
	}

	// TODO: Test for collision among: player_bullets and enemy_bullets, enemy_bullets and player, player_bullets and enemies
};


Engine.prototype.get_entities = function() {
	return [this.player].concat(this.enemies, this.enemy_bullets, this.player_bullets);
};
