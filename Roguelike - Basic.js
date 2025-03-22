class Dungeon {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.map = this.generateMap();
		this.player = new Player(1, 1, this);
		this.enemies = this.spawnEnemies(5);
		this.items = this.spawnItems(3);
	}

	generateMap() {
		let map = [];
		for (let y = 0; y < this.height; y++) {
			let row = [];
			for (let x = 0; x < this.width; x++) {
				row.push(Math.random() > 0.2 ? '.' : '#'); // '.' = floor, '#' = wall
			}
			map.push(row);
		}
		return map;
	}

	spawnEnemies(count) {
		let enemies = [];
		for (let i = 0; i < count; i++) {
			let x, y;
			do {
				x = Math.floor(Math.random() * this.width);
				y = Math.floor(Math.random() * this.height);
			} while (this.map[y][x] === '#' || (x === 1 && y === 1));
			enemies.push(new Enemy(x, y));
		}
		return enemies;
	}

	spawnItems(count) {
		let items = [];
		for (let i = 0; i < count; i++) {
			let x, y;
			do {
				x = Math.floor(Math.random() * this.width);
				y = Math.floor(Math.random() * this.height);
			} while (this.map[y][x] === '#' || (x === 1 && y === 1));
			items.push(new Item(x, y, "Potion"));
		}
		return items;
	}

	display() {
		let output = "";
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (this.player.x === x && this.player.y === y) {
					output += '@';
				} else if (this.enemies.some(e => e.x === x && e.y === y)) {
					output += 'E';
				} else if (this.items.some(i => i.x === x && i.y === y)) {
					output += '!';
				} else {
					output += this.map[y][x];
				}
			}
			output += '\n';
		}
		console.log(output);
	}
}

class Player {
	constructor(x, y, dungeon) {
		this.x = x;
		this.y = y;
		this.hp = 10;
		this.inventory = [];
		this.dungeon = dungeon;
	}

	move(dx, dy) {
		let newX = this.x + dx;
		let newY = this.y + dy;
		if (this.dungeon.map[newY][newX] !== '#') {
			this.x = newX;
			this.y = newY;
			this.checkForItems();
			this.checkForEnemies();
		}
	}

	checkForItems() {
		let itemIndex = this.dungeon.items.findIndex(i => i.x === this.x && i.y === this.y);
		if (itemIndex !== -1) {
			let item = this.dungeon.items.splice(itemIndex, 1)[0];
			this.inventory.push(item);
			console.log(`You picked up a ${item.name}!`);
		}
	}

	checkForEnemies() {
		let enemy = this.dungeon.enemies.find(e => e.x === this.x && e.y === this.y);
		if (enemy) {
			console.log("You encountered an enemy! Fighting...");
			while (this.hp > 0 && enemy.hp > 0) {
				enemy.hp -= 2;
				console.log(`You hit the enemy! Enemy HP: ${enemy.hp}`);
				if (enemy.hp > 0) {
					this.hp -= 1;
					console.log(`The enemy hits you! Your HP: ${this.hp}`);
				}
			}
			if (this.hp > 0) {
				console.log("You defeated the enemy!");
				this.dungeon.enemies = this.dungeon.enemies.filter(e => e.hp > 0);
			} else {
				console.log("You died...");
				process.exit();
			}
		}
	}
}

class Enemy {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.hp = 5;
	}
}

class Item {
	constructor(x, y, name) {
		this.x = x;
		this.y = y;
		this.name = name;
	}
}

// Game Loop
const dungeon = new Dungeon(10, 10);
console.log("Welcome to the dungeon! Use W, A, S, D to move.");
dungeon.display();

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

function gameLoop() {
	readline.question("Move (W/A/S/D): ", (input) => {
		input = input.toUpperCase();
		if (input === 'W') dungeon.player.move(0, -1);
		if (input === 'S') dungeon.player.move(0, 1);
		if (input === 'A') dungeon.player.move(-1, 0);
		if (input === 'D') dungeon.player.move(1, 0);

		console.clear();
		dungeon.display();
		if (dungeon.player.hp > 0) gameLoop();
	});
}

gameLoop();