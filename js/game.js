/**
 * Created by Administrator on 2015-07-26.
 */
(function() {
    //var width = window.innerWidth;
    var width = 800;
    var height = window.innerHeight > 480 ? 480 : window.innerHeight;
    var gameScore = 0;
    var SantaGame = {
        init: function() {
            this.game = new Phaser.Game(width, height, Phaser.CANVAS, 'game');
            this.game.state.add('boot', this.boot);
            this.game.state.add('load', this.load);
            this.game.state.add('play', this.play);
            this.game.state.add('title', this.title);
            this.game.state.add('gameOver', this.gameOver);
            this.game.state.start('load');
        },
        boot:{
            preload: function () {
                this.game.load.image('loading','assets/xiaoshixiaoguo.png');
            },
            create: function () {
                this.game.state.start('load');
            }

        },
        load: {
            preload: function() {
                var preloadSprite = this.game.add.sprite(this.game.world.width / 2 ,this.game.world.height / 2 ,'loading'); //创建显示loading进度的sprite
                this.game.load.setPreloadSprite(preloadSprite);
                // this.game.load.audio('drivin-home', 'assets/world.wav');
                // this.game.load.audio('ho-ho-ho', 'assets/bonbon.wav');
                // this.game.load.audio('hop', 'assets/bomb.wav');
                this.game.load.image('platform', 'assets/1.png');
                this.game.load.spritesheet('santa-running', 'assets/runman.png', 493/5, 174,5);
                this.game.load.image('snow-bg', 'assets/beijing1.jpg');
                this.game.load.image('snow-bg-2', 'assets/yuanjing1.png');
                this.game.load.image('snowflake', 'assets/xiaoshixiaoguo.png');
                this.game.load.image('logo', 'assets/name.png');
                this.game.load.image('startbtn', 'assets/bangzhujiantou.png');
            },
            create: function() {
                this.game.state.start('title');
            }
        },
        title: {
            create: function() {

                this.bg_heaven = this.game.add.tileSprite(0, 0, width, height, 'snow-bg-2').autoScroll(-50,0);
                this.bg = this.game.add.tileSprite(0, 0, width, height, 'snow-bg').autoScroll(-100,0);
                this.logo = this.game.add.sprite(this.game.world.width / 2 - 158, 20, 'logo');
                this.logo.alpha = 0;
                this.game.add.tween(this.logo).to({
                    alpha: 1
                }, 1000, Phaser.Easing.Linear.None, true, 0);
                this.startBtn = this.game.add.button(this.game.world.width / 2 - 89, this.game.world.height - 120, 'startbtn', this.startClicked);
                this.startBtn.alpha = 0;
                this.game.add.tween(this.startBtn).to({
                    alpha: 1
                }, 1000, Phaser.Easing.Linear.None, true, 1000);


            },
            startClicked: function() {
                this.game.state.start('play');
            }
        },

        play: {
            create: function() {
                gameScore = 0;
                this.currentFrame = 0;
                this.particleInterval = 2 * 60;
                this.gameSpeed = 580;
                this.isGameOver = false;
                this.game.physics.startSystem(Phaser.Physics.ARCADE);
                // this.music = this.game.add.audio('drivin-home');
                // this.music.loop = true;
                // this.music.play();
                this.bg_heaven = this.game.add.tileSprite(0, 0, width, height, 'snow-bg-2').autoScroll(-50,0);
                this.bg = this.game.add.tileSprite(0, 0, width, height, 'snow-bg');
                this.bg.fixedToCamera = true;
                this.bg.autoScroll(-this.gameSpeed / 6, 0);
                this.emitter = this.game.add.emitter(this.game.world.centerX, -32, 50);
                this.platforms = this.game.add.group();
                this.platforms.enableBody = true;
                this.platforms.createMultiple(5, 'platform', 0, false);
                this.platforms.setAll('anchor.x', 0.5);
                this.platforms.setAll('anchor.y', 0.5);
                var plat;
                for (var i = 0; i < 5; i++) {
                    plat = this.platforms.getFirstExists(false);
                    plat.reset(i * 192, this.game.world.height - 44);
                    plat.width = 300*0.6;
                    plat.height = 88*0.6;
                    this.game.physics.arcade.enable(plat);
                    plat.body.immovable = true;
                    plat.body.bounce.set(0);
                }
                this.lastPlatform = plat;
                this.santa = this.game.add.sprite(100, this.game.world.height - 200, 'santa-running');
                this.santa.animations.add('run');
                this.santa.animations.play('run', 15, true);
                this.santa.width = (493/5)*0.5;
                this.santa.height = 174*0.5;
                this.game.physics.arcade.enable(this.santa);
                this.santa.body.gravity.y = 1500;
                this.santa.body.collideWorldBounds = true;
                this.emitter.makeParticles('snowflake');
                this.emitter.maxParticleScale = 0.02;
                this.emitter.minParticleScale = 0.001;
                this.emitter.setYSpeed(100, 200);
                this.emitter.gravity = 0;
                this.emitter.width = this.game.world.width * 1.5;
                this.emitter.minRotation = 0;
                this.emitter.maxRotation = 40;
                this.game.camera.follow(this.santa);
                this.cursors = this.game.input.keyboard.createCursorKeys();
                this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
                this.emitter.start(false, 0, 0);
                this.score = this.game.add.text(20, 20, '', {
                    font: '24px Arial',
                    fill: 'white'
                });
            },
            update: function() {
                var that = this;
                if (!this.isGameOver) {
                    gameScore += 0.5;
                    this.gameSpeed += 0.03;
                    this.score.text = 'Score: ' + Math.floor(gameScore);
                    this.currentFrame++;
                    var moveAmount = this.gameSpeed / 100;
                    this.game.physics.arcade.collide(this.santa, this.platforms);
                    if (this.santa.body.bottom >= this.game.world.bounds.bottom) {
                        this.isGameOver = true;
                        this.endGame();
                    }
                    if (this.cursors.up.isDown && this.santa.body.touching.down || this.spacebar.isDown && this.santa.body.touching.down || this.game.input.mousePointer.isDown && this.santa.body.touching.down || this.game.input.pointer1.isDown && this.santa.body.touching.down) {
                        // this.jumpSound = this.game.add.audio('hop');
                        // this.jumpSound.play();
                        this.santa.body.velocity.y = -500;
                    }
                    if (this.particleInterval === this.currentFrame) {
                        this.emitter.makeParticles('snowflake');
                        this.currentFrame = 0;
                    }
                    this.platforms.children.forEach(function(platform) {
                        platform.body.position.x -= moveAmount;
                        if (platform.body.right <= 0) {
                            platform.kill();
                            var plat = that.platforms.getFirstExists(false);
                            plat.reset(that.lastPlatform.body.right + 192, that.game.world.height - Math.floor(Math.random() * 50) - 24);
                            plat.body.immovable = true;
                            that.lastPlatform = plat;
                        }
                    });
                }
            },
            endGame: function() {
                // this.music.stop();
                // this.music = this.game.add.audio('ho-ho-ho');
                // this.music.play();
                this.game.state.start('gameOver');
            }
        },
        gameOver: {
            create: function() {
                this.bg_heaven = this.game.add.tileSprite(0, 0, width, height, 'snow-bg-2').autoScroll(-50,0);
                this.bg = this.game.add.tileSprite(0, 0, width, height, 'snow-bg');
                this.bg.autoScroll(-this.gameSpeed / 6, 0);
                this.score = this.game.add.text(this.game.world.width / 2 - 100, 200, 'Score: ' + Math.floor(gameScore), {
                    font: '42px Arial',
                    fill: 'white'
                });
                this.score.alpha = 0;
                this.game.add.tween(this.score).to({
                    alpha: 1
                }, 600, Phaser.Easing.Linear.None, true, 600);
                this.restartBtn = this.game.add.button(this.game.world.width / 2 - 103.5, 280, 'startbtn', this.restartClicked);
                this.restartBtn.alpha = 0;
                this.game.add.tween(this.restartBtn).to({
                    alpha: 1
                }, 600, Phaser.Easing.Linear.None, true, 1000);
            },
            restartClicked: function() {
                this.game.state.start('play');
            }
        }
    };
    SantaGame.init();
}());