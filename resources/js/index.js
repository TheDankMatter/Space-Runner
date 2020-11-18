class SpaceObject {
    
    constructor(x, y, speed = 2) {
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

}


class Shot extends SpaceObject {

    constructor(x, y, speed = 2){
        super(x, y, speed);
    }

    move() {
        this.x += this.speed;
    }

    movePrint() {
        this.move();
        ctx.beginPath();
        ctx.rect(this.x, this.y, 10, 3);
        ctx.fillStyle = "White";
        ctx.fill();
        ctx.closePath();
    }

    getMaxX() {
        return this.x + 5;
    }

    getMaxY() {
        return this.y + 3;
    }

}


class Ship extends SpaceObject {

    constructor(x, y, speed = 1, width = 30, height = 20) {
        super(x, y, speed);
        this.width = width;
        this.height = height;
    }

    moveUp() {
        this.y -= this.speed;
    }

    moveDown() {
        this.y += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    moveRight() {
        this.x += this.speed;
    }

    getShotX() {
        return this.x + this.width;
    }

    getShotY() {
        return this.y + this.height / 2;
    }

    getMaxY() {
        return this.y + this.height;
    }

    getMaxX() {
        return this.x + this.width;
    }

    print() {
        
        if (shipAnimationCounter <= 5) {
            this.printFrame(0);
        } else if (shipAnimationCounter <= 10) {
            this.printFrame(1);
        } else if (shipAnimationCounter <= 15) {
            this.printFrame(2);
        } else if (shipAnimationCounter <= 20) {
            this.printFrame(3);
            shipAnimationCounter = -1;
        }
        shipAnimationCounter++;
    }

    checkCollision(enemy) {
        if ((ship.getMaxX() >= enemy.getX()) && (ship.getX() <= enemy.getMaxX())) {
            if ((ship.getMaxY() >= enemy.getY()) && (ship.getY() <= enemy.getMaxY())) {
                //Ship collision with enemy
                return true;
            }
        }
        return false;
    }

    printFrame(frame) {
        ctx.beginPath();
        ctx.drawImage(shipImages[frame], this.x, this.y, this.width, this.height);
        ctx.closePath();
    }

}


class Enemy extends SpaceObject {

    constructor(x, y, speed = 1, life = 1) {
        super(x, y, speed);
        this.life = life;
    }

    subtractLife() {
        this.life -= 1;
    }
    
    getLife() {
        return this.life;
    }

    move() {
        this.x -= this.speed;
    }

    lifeIsZero() {
        if (this.life == 0) {
            return true;
        }
        return false;
    }
}


class EnemyRectangle extends Enemy {
    
    constructor(x, y, speed = 1, life = 1,  width = 40, height = 50) {
        super(x, y, speed, life);
        this.width = width;
        this.height = height;
    }

    print() {
        ctx.beginPath();
        ctx.globalAlpha = 0.1 * this.life; 
        ctx.rect(this.x, this.y, this.width, this.height);
        //let colorCode = 200 / this.life;
        //ctx.fillStyle = 'rgb('+colorCode+', '+colorCode+', '+colorCode+')';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fill();
        ctx.closePath();
    }

    getMaxX() {
        return this.x + this.width;
    }

    getMaxY() {
        return this.y + this.height;
    }
}




//##############################################################################
//Game loops

// Initialize variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
var shotsArray = [];
var ship = new Ship(100, 100, 10);
var moveUp = false;
var moveDown = false;
var moveLeft = false;
var moveRight = false;
var spacePressed = false;
var enemiesArray = [[],[],[],[]];
var points = 0;
var loopCounter = 0;
var shipAnimationCounter = 0;
var enterPressed = false;
var shipImages = [];
for(let i = 0; i < 4; i++) {
    shipImages.push(new Image(30, 20));
    shipImages[i].src = 'resources/images/ship/ship' + (i+1) + '.jpg';
}
var interval = setInterval(startScreen, 100); //Start screen call


// Start screen
function startScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "50px Arial";
    ctx.strokeText("Space Runner", 140, 150);
    ctx.font = "20px Arial";
    ctx.strokeText("Press 'Enter' to play", 210, 220);
    ctx.strokeText("Movement 'WSAD', press 'Space' to shoot", 120, 370 );
    scanKeys();
    if (enterPressed) {
        //console.log("Key pressed");
        clearInterval(interval);
        //console.log("Im here");
        interval = setInterval(mainLoop, 20);
        //event.preventDefault();
        //startMain = false;
    }
}

// Game loop
function mainLoop() {

    // Clear canvas and paint it black
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.rect(0, 0, 600, 400);
    ctx.fillStyle = "Black";
    ctx.fill();
    ctx.closePath();

    loopCounter += 1;
    if (loopCounter == 50) {
        spawnEnemiesRow();
        loopCounter = 0;
    }
    // Print Ship and check for input
    ship.print();
    scanKeys();

    // Print points
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "White";
    ctx.fillText("Score: " + points, 0, 395);

    // Ship movement
    if (loopCounter % 5 == 0) {
        if (moveUp) {
            if (ship.getY() >= 10){
                ship.moveUp();
            }
        } else if (moveDown) {
            if (ship.getMaxY() <= 390) {
                ship.moveDown();
            }
        } else if (moveLeft) {
            if (ship.getX() >= 10) {
                ship.moveLeft();
            }
        } else if (moveRight) {
            if (ship.getMaxX() <= 590) {
            ship.moveRight();
            }
        }
    }

    // Shooting
    if (spacePressed) {
        if (shotsArray.length == 0) {
            shotsArray.push(new Shot(ship.getShotX() , ship.getShotY()));
        } else if (shotsArray[shotsArray.length - 1].getX() >= ship.getShotX() + 20) {
            shotsArray.push(new Shot(ship.getShotX() , ship.getShotY()));
        } 
    }

    // Iterate over shots, remove shots out of range, check shots for hits
    for (let i = 0; i < shotsArray.length; i++) { // Iter over shots array
        shotsArray[i].movePrint();          // Move shots
        if (shotsArray[i].getX() > 600) {   // Remove shots out of range
            shotsArray.splice(i, 1);
            i--;
            continue;
        }

        if (shotsArray[i].getY() <= 100) {
            i = checkShotCollision(i, 0);
        } else if ((shotsArray[i].getY() <= 200)) {
            i = checkShotCollision(i, 1);
        } else if ((shotsArray[i].getY() <= 300)) {
            i = checkShotCollision(i, 2);
        } else if ((shotsArray[i].getY() <= 400)) {
            i = checkShotCollision(i, 3);
        }
    }

    // Print enemies on canvas
    printEnemiesCheckShipCollision();

}

// Game over screen
function gameOver() {
    enterPressed = false;
    clearInterval(interval);
    interval = setInterval(gameOverLoop, 100);
}

function gameOverLoop() {
    scanKeys();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.font = "50px Arial";
    ctx.strokeText("Game Over", 175, 150);
    ctx.font = "20px Arial";
    ctx.strokeText("Your score: " + points, 225, 200);
    ctx.font = "20px Arial";
    ctx.strokeText("Press 'Enter' to restart", 210, 300);
    if (enterPressed) {
        shotsArray = [];
        ship = new Ship(100, 100, 10);
        enemiesArray = [[],[],[],[]];
        points = 0;
        loopCounter = 0;
        shipAnimationCounter = 0;
        clearInterval(interval);
        interval = setInterval(mainLoop, 20);
    }
}

//End of Game loops
//##############################################################################


function spawnEnemiesRow() {
    enemiesArray[0].push(new EnemyRectangle(getRandomInt(400, 550), getRandomInt(  0,  50), 1, getRandomInt(2, 10)));
    enemiesArray[1].push(new EnemyRectangle(getRandomInt(400, 550), getRandomInt(100, 150), 1, getRandomInt(2, 10)));
    enemiesArray[2].push(new EnemyRectangle(getRandomInt(400, 550), getRandomInt(200, 250), 1, getRandomInt(2, 10)));
    enemiesArray[3].push(new EnemyRectangle(getRandomInt(400, 550), getRandomInt(300, 350), 1, getRandomInt(2, 10)));
}


function printEnemiesCheckShipCollision() {
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < enemiesArray[j].length; i++) {
            enemiesArray[j][i].move();
            enemiesArray[j][i].print();
            if (ship.checkCollision(enemiesArray[j][i])) {
                gameOver();
                return;
            }
        }
    }
}


function scanKeys() {
    //Key down
    document.onkeypress = function(event){
        if (event.code === 'Enter') { enterPressed = true;}
        if (event.code === 'Space') { spacePressed = true;}
        if (event.code === 'KeyW')  { moveUp       = true;}
        if (event.code === 'KeyS')  { moveDown     = true;}
        if (event.code === 'KeyA')  { moveLeft     = true;}
        if (event.code === 'KeyD')  { moveRight    = true;}
    }
    //Key up
    document.onkeyup = function(event){
        if (event.code === 'Space') { spacePressed = false;}
        if (event.code === 'KeyW')  { moveUp       = false;}
        if (event.code === 'KeyS')  { moveDown     = false;}
        if (event.code === 'KeyA')  { moveLeft     = false;} 
        if (event.code === 'KeyD')  { moveRight    = false;}
    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function checkShotCollision(shotPosition, enemyPosition) {
    for (let nthEnemy = 0; nthEnemy < enemiesArray[enemyPosition].length; nthEnemy++) {
        if ((shotsArray[shotPosition].getMaxX() >= enemiesArray[enemyPosition][nthEnemy].getX()) && (shotsArray[shotPosition].getX() <= enemiesArray[enemyPosition][nthEnemy].getMaxX())) {     // if shot x coordinates aligns with enemy x coordinates
            if ((shotsArray[shotPosition].getMaxY() >= enemiesArray[enemyPosition][nthEnemy].getY()) && (shotsArray[shotPosition].getY() <= enemiesArray[enemyPosition][nthEnemy].getMaxY())) { // if shot y coordinates aligns with enemy y coordinates
                enemiesArray[enemyPosition][nthEnemy].subtractLife();
                points += 10;
                if (enemiesArray[enemyPosition][nthEnemy].lifeIsZero()) {
                    enemiesArray[enemyPosition].splice(nthEnemy, 1); //Remove enemy
                    points += 100;
                }
                shotsArray.splice(shotPosition, 1);
                return shotPosition - 1;
            }
        }
    }
    return shotPosition;
}