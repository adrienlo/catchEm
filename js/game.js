// TODO: work with designers to find out optimal size for the game
// add a function to find out the game's scale relative to that
var platform,
	player,
	cursors,
	presents,
	score,
	scoreText,
	NUM_PRESENTS = 50,
	MAX_SPEED = 150,
	GOLDEN_RATIO = 1.618,
	BASE_WIDTH = 400,
	BASE_HEIGHT = BASE_WIDTH/GOLDEN_RATIO,
	timer,
	timerCount,
	timerText,
	presentTypes = [
	'red_gift',
	'purple_gift',
	'blue_gift'
	],gameElem = document.querySelector('#game'),
	game = new Phaser.Game(gameElem.offsetWidth, gameElem.offsetWidth/GOLDEN_RATIO, Phaser.AUTO, 'game', 'loading');


var loading = function(game){};
loading.prototype = {
	preload: function(){
		game.load.image('background', 'img/background.png');
		game.load.image('red_gift', 'img/present_1.png');
		game.load.image('purple_gift', 'img/present_2.png');
		game.load.image('blue_gift', 'img/present_3.png');
		game.load.image('ground', 'img/ground.png');
		game.load.spritesheet('dude', 'img/dude.png', 32, 48);
		game.load.image('start_button', 'img/play_button.png');

		this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		this.scale.refresh();
	},
	create: function(){
		this.startButton = this.add.button(game.width/2 - 100, game.height/2 - 50, 'start_button', this.startGame, this); // x, y, spriteSheet, callback, callbackContext, overFrame, outFrame, downFrame
	},
	update: function(){

	},
	startGame: function(){
		game.state.start('mainLoop');
	}
};

var mainLoop = function(game){};
mainLoop.prototype = {
	create: function(){
		// We're going to be using physics, so enable the Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);
		var background = game.add.sprite(0, 0, 'background');
		background.inputEnabled = true;

		timerCount = 60;
		score = 0;
		var fontStyle = { fontSize: '32px', fill: '#fff' };
		scoreText = game.add.text(16, 16, 'Score: ' + score.toString(), fontStyle);
		timerText = game.add.text(game.width-50, 16, timerCount.toString(), fontStyle);

		timer = setInterval(function(){
			timerCount--;
			if(timerCount === 0){
				game.state.start('loading');
				clearInterval(timer);
			}
		}, 1000);

		platform = game.add.group();
		platform.enableBody = true;
		var ground = platform.create(0, game.height-32, 'ground');
		ground.body.immovable = true;

		// player and settings
		player = game.add.sprite(32, game.height - 150, 'dude');
		game.physics.arcade.enable(player);

		player.body.bounce.y = 0.2;
		player.body.gravity.y = 300;
		player.body.collideWorldBounds = true;

		player.animations.add('left', [0, 1, 2, 3], 10, true);
		player.animations.add('right', [5, 6, 7, 8], 10, true);

		player.moveLeft = function(){
			player.body.velocity.x = -200;
			player.animations.play('left');
		};

		player.moveRight = function(){
			player.body.velocity.x = 200;
			player.animations.play('right');
		};
		player.stop = function(){
			player.animations.stop();
			player.frame = 4;
		};

		// controls
		cursors = game.input.keyboard.createCursorKeys();

		// Capture certain keys to prevent their default actions in the browser.
		// This is only necessary because this is an HTML5 game. Games on other
		// platforms may not need code like 
		game.input.keyboard.addKeyCapture([
			Phaser.Keyboard.LEFT,
			Phaser.Keyboard.RIGHT
		]);

		// presents
		presents = game.add.group();
		presents.enableBody = true;
		for(var i = 0; i < NUM_PRESENTS; i++){
			this.createRandomPresent();
		}
	},
	update: function(){
		//update score
		scoreText.text = "Score: " + score;
		timerText.text = timerCount.toString();

		game.physics.arcade.collide(player, platform);

		game.physics.arcade.overlap(platform, presents, this.missPresent, null, this);
		game.physics.arcade.overlap(player, presents, this.collectPresent, null, this);

		player.body.velocity.x = 0;

		if (this.isLeftActive()){
			player.moveLeft();
		} else if (this.isRightActive()){
			player.moveRight();
		} else {
			player.stop();
		}
	},
	missPresent: function(platform, present){
		present.kill();
		this.createRandomPresent();
	},
	collectPresent: function(player, present){
		score += 10;
		present.kill();
		this.createRandomPresent();
	},
	createRandomPresent: function(){
		this.createPresent(Math.random() * game.width, Math.random() * -10, presentTypes[Math.floor(Math.random() * presentTypes.length)], Math.random() * 100 + 200);
	},
	createPresent: function(x, y, presentType, gravity){
		var present = presents.create(Math.random() * game.width, Math.random() * -5000, presentTypes[Math.floor(Math.random() * presentTypes.length)]);
		present.body.gravity.y = gravity;
		present.body.maxVelocity.setTo(0, MAX_SPEED); //x, y
	},
	isLeftActive: function(){
		var isActive = false;

		isActive = game.input.keyboard.isDown(Phaser.Keyboard.LEFT);
		isActive |= (game.input.activePointer.isDown &&
		this.game.input.activePointer.x + 5 < (player.body.x + (player.texture.width)/2));

		return isActive;
	},
	isRightActive: function(){
		var isActive = false;

		isActive = game.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
		isActive |= (game.input.activePointer.isDown &&
		game.input.activePointer.x - 5 > (player.body.x + (player.texture.width)/2));

		return isActive;
	}
};

var finish =function(game){};
finish.prototype = {
	update: function(){

	}
};

game.state.add('loading', loading, true);
game.state.add('mainLoop', mainLoop, true);
game.state.add('finish', finish, true);

game.state.start('loading');