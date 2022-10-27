var screen, input, frames, spriteFrame, frameSpeed;
var aliensSprite, tankSprite, defendWallSprite, sweetSprite, lifeSprite;
var aliens, direction, tank, bullets, defendWall, sweet, life;
var aliensRows = [];
var aliensCols = 0;
var alienHits = 0.06;
var tankLife = 3;
var defaultAlienTotal = 0;
var timer = 60;
var score = 0;
var currentWalkinRow = 1;
var appearSweet = false;
var ateSweet = false;
var aliensHitTank = false;
var shootAudio;
var invaderKilledAudio;
var explosionAudio;

function welcome() {

    screen = new Screen(800, 600);
    input = new InputKeyHandeler();
    var time = 0;

    var loopPic = function() {

        screen.clear();
        time++;
        screen.drawWords(new Words("Welcome to Space Invader", 800 / 4.5, 200, "bold 36px Arial", "#fff"));

        if (time % 5 > 1) {

            screen.drawWords(new Words("Press Space to Start", 800 / 2.8, 300, "bold 24px Arial", "#fff"));

        }

        if (input.isPressed(32)) {

            screen.clear();
            chooseLevel();

        } else {

            window.requestAnimationFrame(loopPic, screen.canvas);

        }

    };

    // first time to render frame
    window.requestAnimationFrame(loopPic, screen.canvas);

}

function chooseLevel() {

    var choosed = 0;

    var loopPic = function() {

        screen.clear();

        screen.drawWords(new Words("Choose Level", 800 / 2.8, 200, "bold 36px Arial", "#fff"));


        if (choosed == 0) {

            screen.drawWords(new Words("Easy", 800 / 2.5, 250, "24px Arial", "#0f0"));
            screen.drawWords(new Words("Difficult", 800 / 1.9, 250, "24px Arial", "#fff"));

        } else {

            screen.drawWords(new Words("Easy", 800 / 2.5, 250, "24px Arial", "#fff"));
            screen.drawWords(new Words("Difficult", 800 / 1.9, 250, "24px Arial", "#0f0"));

        }

        screen.drawWords(new Words("(Use left and right to Choose, then press enter)", 800 / 3.5, 300, "18px Arial", "#fff"));

        if (input.isPressed(37) && choosed != 0) {

            choosed--;

        }

        if (input.isPressed(39) && choosed != 1) {

            choosed++;

        }

        if (input.isPressed(13)) {

            screen.clear();

            if (choosed == 0) {

                aliensRows = [1, 0, 0, 2, 2];
                aliensCols = 11;
                timer = 60;

            } else {

                aliensRows = [1, 1, 0, 0, 0, 2, 2];
                aliensCols = 15;
                timer = 45;


            }

            main();

        } else {

            window.requestAnimationFrame(loopPic, screen.canvas);

        }

    };

    // first time to render frame
    window.requestAnimationFrame(loopPic, screen.canvas);

}

function main() {

    score = 0;
    tankLife = 3;
    currentWalkinRow = 1;
    appearSweet = false;
    ateSweet = false;
    aliensHitTank = false;
    stopTimer();
	frameSpeed = 35;

    var sweetimg = new Image();
   sweetimg.src = "https://lh6.googleusercontent.com/pugy6eSkQLWdduDkcqvJmLthBokw3zlrH52VHWXsmr1AZF3HurMTrzthB71JhKyap2k=w2400";
    sweetimg.crossOrigin = "Anonymous";

    var lifeimg = new Image();
    lifeimg.src = "https://lh3.googleusercontent.com/ipksy5OyDzUjQOYGPzB0nE-YTb5Q-33ot2QEOXMiH-HufwhNPuvyiqENWB8buhhk_6s=w2400";
    lifeimg.crossOrigin = "Anonymous";

    var img = new Image();
    img.src = "https://lh5.googleusercontent.com/a41uksI9BPJfrZmml73X3q7WkQHxdd9qg7LgNYfG9xZ7LvPbYrY9i70QEcp9EZdq1TM=w2400";
    img.crossOrigin = "Anonymous";
    img.addEventListener("load", function() {

        aliensSprite = [
            [new Sprite(this, 0, 0, 22, 16), new Sprite(this, 0, 16, 22, 16)],
            [new Sprite(this, 22, 0, 16, 16), new Sprite(this, 22, 16, 16, 16)],
            [new Sprite(this, 38, 0, 24, 16), new Sprite(this, 38, 16, 24, 16)]
        ];
        tankSprite = new Sprite(this, 62, 0, 22, 16);
        defendWallSprite = new Sprite(this, 84, 8, 36, 24);
        sweetSprite = new Sprite(sweetimg, 0, 0, 28, 29);
        lifeSprite = new Sprite(lifeimg, 0 , 0, 26, 24);

        init();
        run();

    });

};

function init() {
	
    shootAudio = new Audio("res/shoot.wav");
    invaderKilledAudio = new Audio("res/invaderkilled.wav");
    explosionAudio = new Audio("res/explosion.wav");
    frames = 0;
    spriteFrame = 0;
    direction = 1;
    aliens = [];

    tank = {
        sprite: tankSprite,
        x: (screen.width - tankSprite.w) / 2,
        y: screen.height - (30 + tankSprite.h)
    };

    sweet = {
        sprite: sweetSprite,
        x: Math.floor((Math.random() * (800 - 70)) + 70),
        y: screen.height - (30 + sweetSprite.h)
    };

    life = {
    	sprite : lifeSprite,
    	x: 50,
    	y: 575
    }

    bullets = [];

    defendWall = {
        canvas: null,
        ctx: null,
        y: tank.y - (30 + defendWallSprite.h),
        h: defendWallSprite.h,
        locationX: [],
        wallLife: [],

        /**
         * Create canvas and game graphic context
         */
        init: function() {
            // create canvas and grab 2d context
            this.canvas = document.createElement("canvas");
            this.canvas.width = screen.width;
            this.canvas.height = this.h;
            this.ctx = this.canvas.getContext("2d");


            var num = Math.floor((Math.random() * 4) + 1);
            var startSprite = (screen.width / (num + 1)) - (defendWallSprite.w / 2);

            for (var i = 0; i < num; i++) {

                this.ctx.drawImage(defendWallSprite.img, defendWallSprite.x, defendWallSprite.y,
                    defendWallSprite.w, defendWallSprite.h,
                    startSprite + (Math.min(startSprite, screen.width - startSprite) + (defendWallSprite.w / 2)) * i, 0, defendWallSprite.w, defendWallSprite.h);
                this.locationX.push(startSprite + (Math.min(startSprite, screen.width - startSprite) + (defendWallSprite.w / 2)) * i);
                this.wallLife.push(3);

            }
        },

        generateDamage: function(x, y) {

            x = Math.floor(x / 2) * 2;
            y = Math.floor(y / 2) * 2;

            this.ctx.clearRect(x - 2, y - 2, 4, 4);
            this.ctx.clearRect(x + 2, y - 4, 2, 4);
            this.ctx.clearRect(x + 4, y, 2, 2);
            this.ctx.clearRect(x + 2, y + 2, 2, 2);
            this.ctx.clearRect(x - 4, y + 2, 2, 2);
            this.ctx.clearRect(x - 6, y, 2, 2);
            this.ctx.clearRect(x - 4, y - 4, 2, 2);
            this.ctx.clearRect(x - 2, y - 6, 2, 2);
        },

        hits: function(x, y) {

            y -= this.y;
            var tempI;
            var tempX;

            loop: {

                for (i = 0; i < this.locationX.length; i++) {

                    if (x <= (this.locationX[i] + 36) && x >= this.locationX[i]) {

                        tempI = i;
                        tempX = this.locationX[i];

                        break loop;

                    }
                }

            }

            this.wallLife[tempI]--;

            if (this.wallLife[tempI] > 0) {

                this.generateDamage(x, y);
                return true;

            } else if (this.wallLife[tempI] == 0) {

                this.ctx.clearRect(tempX, 0, 36, 24);
                return true;

            }

            return false;

        },

        crash: function(x) {

        	var tempX;

        	loop: {

                for (i = 0; i < this.locationX.length; i++) {

                    if (x <= (this.locationX[i] + 36) && x >= this.locationX[i]) {

                        tempX = this.locationX[i];

                        break loop;

                    }
                }

            }

           this.ctx.clearRect(tempX, 0, 36, 24);

        }
    };

    defendWall.init();

    var s = aliensRows.length * 10;

    for (var i = 0, len = aliensRows.length; i < len; i++) {
        for (var j = 0; j < aliensCols; j++) {

            var aliensType = aliensRows[i];
            defaultAlienTotal++;
            aliens.push({
                sprite: aliensSprite[aliensType],
                x: 16 + j * 30 + [0, 4, 0][aliensType],
                y: 30 + i * 30,
                w: aliensSprite[aliensType][0].w,
                h: aliensSprite[aliensType][0].h,
                s: s
            });

        }

        s = s - 10;

    }

};

function run() {

    startTimer(timer);

    var loopPic = function() {
        update();
        render();

        if (tankLife == 0 || this.timerTime == 0 || aliensHitTank == true) {

            gameOver(true);


        } else if (input.isPressed(82)) {

            screen.clear();
            main();

        } else if (aliens.length == 0) {

            gameOver(false);

        } else {

            window.requestAnimationFrame(loopPic, screen.canvas);

        }

    };

    // first time to render frame
    window.requestAnimationFrame(loopPic, screen.canvas);

};

function gameOver(x) {


    var choosed = 0;
    var loopPic = function() {

        screen.clear();

        if (x) {

            screen.drawWords(new Words("Game Over", 800 / 2.8, 200, "48px Arial", "#fff"));

        } else {

            screen.drawWords(new Words("You Win !!!", 800 / 2.5, 200, "48px Arial", "#fff"));

        }

        screen.drawWords(new Words("Your Score is: " + score, 800 / 2.3, 250, "18px Arial", "#fff"));

        if (choosed == 0) {

            screen.drawWords(new Words("Replay", 800 / 2.5, 300, "24px Arial", "#0f0"));
            screen.drawWords(new Words("Main Menu", 800 / 1.9, 300, "24px Arial", "#fff"));

        } else {

            screen.drawWords(new Words("Replay", 800 / 2.5, 300, "24px Arial", "#fff"));
            screen.drawWords(new Words("Main Menu", 800 / 1.9, 300, "24px Arial", "#0f0"));

        }

        screen.drawWords(new Words("(Use left and right to Choose, then press enter)", 800 / 3.5, 350, "18px Arial", "#fff"));

        if (input.isPressed(37) && choosed != 0) {

            choosed--;

        }

        if (input.isPressed(39) && choosed != 1) {

            choosed++;

        }

        if (input.isPressed(13)) {

            screen.clear();

            if (choosed == 0) {

                main();

            } else {

                chooseLevel();

            }

        } else {

            window.requestAnimationFrame(loopPic, screen.canvas);

        }

    };

    window.requestAnimationFrame(loopPic, screen.canvas);

};

function update() {

    if (input.isDown(37)) {
        tank.x -= 3;
    }

    if (input.isDown(39)) {
        tank.x += 3;
    }

    tank.x = Math.max(Math.min(tank.x, screen.width - (30 + tankSprite.w)), 30);

    if (input.isPressed(32)) {

        if (ateSweet == true) {

            bullets.push(new Bullet(tank.x + 5, tank.y, -8, 2, 6, "#fff", false));

            bullets.push(new Bullet(tank.x - 5, tank.y, -8, 2, 6, "#fff", false));


        } else {

            bullets.push(new Bullet(tank.x + 10, tank.y, -8, 2, 6, "#fff", false));

        }

        if (shootAudio.duration > 0 && !shootAudio.paused) {

            shootAudio.pause();
            shootAudio.currentTime = 0;
            shootAudio.play();

        } else {

            shootAudio.play();

        }
    }

    for (var i = 0, len = bullets.length; i < len; i++) {

        var currentBullet = bullets[i];
        currentBullet.update();

        if (currentBullet.y + currentBullet.h < 0 || currentBullet.y > screen.height) {

            bullets.splice(i, 1);
            i--;
            len--;

        }

        var newH = currentBullet.h * 0.5; // half hight is used for

        if (defendWall.y < currentBullet.y + newH && currentBullet.y + newH < defendWall.y + defendWall.h) {
            if (defendWall.hits(currentBullet.x, currentBullet.y + newH)) {
                bullets.splice(i, 1);
                i--;
                len--;
            }
        }

        for (var k = 0, len2 = aliens.length; k < len2; k++) {

            var currentAlien = aliens[k];

            if (Intersection(currentAlien.x, currentAlien.y, currentAlien.w, currentAlien.h, currentBullet.x, currentBullet.y, currentBullet.w, currentBullet.h) && currentBullet.byAlien == false) {

                score = score + currentAlien.s;

                if (invaderKilledAudio.duration > 0 && !invaderKilledAudio.paused) {

                    invaderKilledAudio.pause();
                    invaderKilledAudio.currentTime = 0;
                    invaderKilledAudio.play();

                } else {

                    invaderKilledAudio.play();

                }

                aliens.splice(k, 1);
                k--;
                len2--;

                bullets.splice(i, 1);
                i--;
                len--;

            }

        }

        if (Intersection(tank.x, tank.y, tankSprite.w, tankSprite.h, currentBullet.x, currentBullet.y, currentBullet.w, currentBullet.h)) {

            if (explosionAudio.duration > 0 && !explosionAudio.paused) {

                explosionAudio.pause();
                explosionAudio.currentTime = 0;
                explosionAudio.play();

            } else {

                explosionAudio.play();

            }

            tankLife--;

            tank.x = (screen.width - tankSprite.w) / 2;

            bullets.splice(i, 1);

            i--;

            len--;

            ateSweet = false;

            doubleShoot = false;

            sweet.x = Math.floor((Math.random() * (800 - 40)) + 40);

        }

    }

    if (Intersection(tank.x, tank.y, tankSprite.w, tankSprite.h, sweet.x, sweet.y, sweetSprite.w, sweetSprite.h)) {

        appearSweet = false;
        ateSweet = true;
        doubleShoot = true;

        screen.clearSprite(sweetSprite.x, sweetSprite.y, sweetSprite.w, sweetSprite.h);

    }

    for (var k = 0, len2 = aliens.length; k < len2; k++) {

            var currentAlien = aliens[k];

            if (Intersection(tank.x, tank.y, tankSprite.w, tankSprite.h, currentAlien.x, currentAlien.y, currentAlien.w , currentAlien.h)) {

                aliensHitTank = true;

            }

             if (defendWall.y < currentAlien.y && currentAlien.y < defendWall.y + defendWall.h) {

            	defendWall.crash(currentAlien.x);

            }
			
			 switch (len2) {

                    case Math.floor(defaultAlienTotal / 1.5):
                        {
                            this.frameSpeed = 25;
                            break;
                        }
                    case Math.floor(defaultAlienTotal / 2.5):
                        {
                            this.frameSpeed = 15;
                            break;
                        }
                    case Math.floor(defaultAlienTotal / 3.5):
                        {
                            this.frameSpeed = 5;
                            break;
                        }
                }


        }


    if (Math.random() < alienHits && aliens.length > 0) {

        var randomAlien = aliens[Math.floor(Math.random() * (aliens.length - 1))];

        bullets.push(new Bullet(randomAlien.x + randomAlien.w, randomAlien.y + randomAlien.h, 8, 2, 6, "#fff", true));
    }

    frames++;

    if (frames % frameSpeed === 0) {

        spriteFrame = (spriteFrame + 1) % 2;
        var _max = 0,
            _min = screen.width;

        for (var i = 0, len = aliens.length; i < len; i++) {

            var aliensType = aliens[i];
            aliensType.x += 30 * direction;

            _max = Math.max(_max, aliensType.x + aliensType.w);
            _min = Math.min(_min, aliensType.x);

        }

        var widthLeft = (screen.width % 30) / 2;

        if (_max > screen.width - widthLeft || _min < widthLeft) {

            direction *= -1;
            currentWalkinRow++;

            for (var i = 0, len = aliens.length; i < len; i++) {

                var aliensType = aliens[i];
                aliensType.x += 30 * direction;
                aliensType.y += 30;

            }

        }

    }

};

function render() {

    screen.clear();

    for (var i = 0, len = aliens.length; i < len; i++) {

        var aliensType = aliens[i];
        screen.drawSprite(aliensType.sprite[spriteFrame], aliensType.x, aliensType.y);

    }

    screen.ctx.save();

    for (var i = 0, len = bullets.length; i < len; i++) {

        screen.drawBullet(bullets[i]);

    }

    screen.ctx.restore();

    screen.ctx.drawImage(defendWall.canvas, 0, defendWall.y);

    screen.drawWords(new Words("Life: ", 5, 590, "18px Arial", "#fff"));

    var locationX = life.x;

    for(var i = 0; i<tankLife; i++){

    	screen.drawSprite(lifeSprite, locationX, life.y);

    	locationX  = locationX + 30;

    }

    

    if (this.timerTime <= 10) {

        screen.drawWords(new Words("Time: " + this.timerTime, 800 / 2.1, 20, "18px Arial", "#f00"));

    } else {

        screen.drawWords(new Words("Time: " + this.timerTime, 800 / 2.1, 20, "18px Arial", "#fff"));

    }

    screen.drawWords(new Words("Score: " + score, 700, 590, "18px Arial", "#fff"));

    screen.drawWords(new Words("(You can press \"R\" to reset the game)", 800 / 3, 590, "18px Arial", "#fff"));

    if (Math.random() < 0.005 && appearSweet == false) {

        appearSweet = true;

    }

    if (appearSweet == true && ateSweet == false) {

    	while(sweet.x == tank.x || sweet.x == tank.x + tankSprite.w || sweet.x == tank.x - tankSprite.w ){

    		sweet.x = Math.floor((Math.random() * (800 - 80)) + 80);

    	}

        screen.drawSprite(sweet.sprite, sweet.x, sweet.y + 5);

    }

    screen.drawSprite(tank.sprite, tank.x, tank.y);
};

welcome();
